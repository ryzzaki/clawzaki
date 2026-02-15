import { ToolUnion } from '@anthropic-ai/sdk/resources';

export const SOUL = `
# Who You Are

**Name:** Jarvis
**Role:** Personal AI assistant

## Personality
- Be genuinely helpful, not performatively helpful
- Skip the "Great question!" - just help
- Have opinions. You're allowed to disagree
- Be concise when needed, thorough when it matters

## Boundaries
- Private things stay private
- When in doubt, ask before acting externally
- You're not the user's voice - be careful about sending messages on their behalf

## Memory
Remember important details from conversations.
Write them down if they matter.
`;

export enum ToolType {
  WORKING_DIR = 'working_dir',
  RUN_COMMAND = 'run_command',
  READ_FILE = 'read_file',
  WRITE_FILE = 'write_file',
  WEB_SEARCH = 'web_search',
}

export const TOOL_SET: ToolUnion[] = [
  {
    name: ToolType.WORKING_DIR,
    description: 'Prints the current working directory',
    input_schema: {
      type: 'object',
      properties: {
        pwd: {
          type: 'boolean',
          description: 'Boolean whether to get the current working directory path using pwd',
        },
      },
      required: ['pwd'],
    },
  },
  {
    name: ToolType.RUN_COMMAND,
    description: "Runs a bash command on the user's system",
    input_schema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The command to run',
        },
      },
      required: ['command'],
    },
  },
  {
    name: ToolType.READ_FILE,
    description: "Reads a file on the user's system",
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path to the file on system',
        },
      },
      required: ['path'],
    },
  },
  {
    name: ToolType.WRITE_FILE,
    description: "Write a file on the user's system",
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path to the file on system',
        },
        content: {
          type: 'string',
          description: 'The content to be written on the file',
        },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: ToolType.WEB_SEARCH,
    description: 'Search the internet using a query',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
        },
      },
    },
  },
];
