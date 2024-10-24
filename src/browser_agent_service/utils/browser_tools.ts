import {
    BetaTool,
    BetaToolUnion,
    BetaToolComputerUse20241022,
  } from '@anthropic-ai/sdk/resources/beta';
  
  import { goToUrl, saveToMemory, claudeComputerTool } from './browser_functions';
  
  // Define the type for the handler function
  type ToolHandler = (input: any) => Promise<any>;
  
  // Define each tool with appropriate types and handlers
  export const tools: Array<(BetaTool | BetaToolComputerUse20241022) & { handler: ToolHandler }> = [
    {
      name: 'save_to_memory',
      description:
        'Saves important information to memory for future use (either as part of the answer or to help you answer future queries).',
      input_schema: {
        type: 'object',
        properties: {
          information: {
            type: 'string',
            description: 'The text to save to memory.',
          },
        },
        required: ['information'],
      },
      handler: saveToMemory,
    },
    {
      name: 'go_to_url',
      description: 'Navigates to a specified URL and returns the page content.',
      input_schema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to navigate to.',
          },
        },
        required: ['url'],
      },
      handler: goToUrl,
    },
    {
      name: 'computer',
      type: 'computer_20241022',
      display_height_px: 1366,
      display_width_px: 768,
      //cache_control: { type: 'ephemeral' },
      handler: claudeComputerTool,
    } as BetaToolComputerUse20241022 & { handler: ToolHandler },
  ];
  
  // Prepare the tools to be sent to the Anthropic SDK (excluding handlers)
  export const anthropicTools: BetaToolUnion[] = tools.map(({ handler, ...tool }) => tool);
  