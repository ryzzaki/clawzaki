import { SOUL, TOOL_SET, ToolType } from './tool-kit';
import fs from 'fs';
import { execSync } from 'node:child_process';
import { ContentBlock, MessageParam, TextBlock, ToolResultBlockParam, ToolUseBlock } from '@anthropic-ai/sdk/resources';
import { checkCmdSafety, saveApproval } from './approvals';
import { userInput } from './utils/user-input';
import { client, LLM_MODEL } from './llm';

const ENABLE_EXEC = process.env.ENABLE_EXEC === '1';

const executeTool = async (name: ToolType, input: { [key: string]: string }): Promise<string> => {
  switch (name) {
    case ToolType.WORKING_DIR:
      return process.cwd();
    case ToolType.RUN_COMMAND:
      const cmd = input['command'];
      const safety = checkCmdSafety(cmd);

      if (safety === 'denied') {
        return 'User denied command usage. Find alternative.';
      }

      if (safety === 'needs_approval') {
        console.log(`Blocked CMD ${cmd} (needs approval)`);

        const answer = await userInput(`Approve the usage of '${cmd}'? [y/n]`);

        if (!['y', 'Y', 'yes', 'Yes', 'YES'].includes(answer)) {
          saveApproval(cmd, false);
          return 'User denied command usage. Find alternative.';
        }

        saveApproval(cmd, true);
      }

      return ENABLE_EXEC ? execSync(input['command'], { encoding: 'utf-8' }) : 'Execution successful';
    case ToolType.READ_FILE:
      return fs.readFileSync(input['path'], 'utf-8');
    case ToolType.WRITE_FILE:
      fs.writeFileSync(input['path'], input['content']);
      return `File written to ${input['path']}`;
    case ToolType.WEB_SEARCH:
      // mock API response
      return `Search results for: ${input['query']}`;
    default:
      return 'Unknown tool name';
  }
};

export const runAgentLoop = async (messages: MessageParam[]) => {
  while (true) {
    const response = await client.messages.create({
      max_tokens: 1024,
      messages,
      // the soul is inject here as the system prompt
      system: SOUL,
      model: LLM_MODEL,
      tools: TOOL_SET,
    });

    const serialized = serializeContent(response.content);

    if (response.stop_reason === 'end_turn') {
      let text = '';

      for (const block of response.content) {
        if (block.type === 'text') {
          text += block.text;
        }
      }

      messages.push({ role: 'assistant', content: serialized });
      return { text, messages };
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: serialized });

      const toolResults: ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          console.log(`Executing tool: ${block.name} with inputs: ${JSON.stringify(block.input)}`);

          const res = await executeTool(block.name as ToolType, block.input as { [key: string]: string });
          toolResults.push({
            tool_use_id: block.id,
            type: 'tool_result',
            content: res,
          });
        }
      }
      // push messages and let the loop continue
      messages.push({ role: 'user', content: toolResults });
    }
  }
};

const serializeContent = (content: ContentBlock[]) => {
  const serialized: (ToolUseBlock | TextBlock)[] = [];

  for (const block of content) {
    if (block.type === 'text') {
      serialized.push({ type: 'text', text: block.text, citations: null });
    }

    if (block.type === 'tool_use') {
      serialized.push({
        type: 'tool_use',
        id: block.id,
        input: block.input,
        name: block.name,
      });
    }
  }

  return serialized;
};
