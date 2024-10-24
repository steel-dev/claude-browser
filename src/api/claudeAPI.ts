// import Anthropic from '@anthropic-ai/sdk';

// const client = new Anthropic({
//     apiKey: "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",
//     dangerouslyAllowBrowser: true // Only use this for development
// });

export const streamMessage = async (
  messageContent: string,
  onContentBlock: (content: string) => void
) => {
  const response = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: messageContent })
  });

  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (let line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        onContentBlock(data);
      }
    }
  }
};
