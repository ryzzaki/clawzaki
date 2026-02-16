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
You have a long-term memory system.
- Use save_memory to store important information (user preferences, key facts, project details).
- Use memory_search at the start of conversations to recall context from previous sessions.
Memory files are stored in ./memories/ as markdown files.
`;

export enum ToolType {
  WORKING_DIR = 'working_dir',
  RUN_COMMAND = 'run_command',
  READ_FILE = 'read_file',
  WRITE_FILE = 'write_file',
  WEB_SEARCH = 'web_search',
  SAVE_MEMORY = 'save_memory',
  SEARCH_MEMORY = 'search_memory',
}

export const TOOL_SET: ToolUnion[] = [
  {
    name: ToolType.SAVE_MEMORY,
    description:
      'Save important decisions to memory. Save user preferences, key facts, and anything that is worth saving to be persistent across sessions.',
    input_schema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: "Short labels such as 'user-preferences' or 'project-notes'",
        },
        content: {
          type: 'string',
          description: 'The information to be remembered',
        },
      },
      required: ['key', 'content'],
    },
  },
  {
    name: ToolType.SEARCH_MEMORY,
    description:
      'Search the persistent long-term memory for context retrieval. Use at the start of every conversation session to recall memories.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Phrase or query to search for',
        },
      },
      required: ['query'],
    },
  },
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
