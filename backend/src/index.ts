import express from 'express';
import { config } from 'dotenv';
import AnthropicApi from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import basicAuth from 'express-basic-auth';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Set up Anthropic client
const anthropic = new AnthropicApi({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Basic authentication middleware
const auth = basicAuth({
  users: { [process.env.AUTH_USERNAME || 'admin']: process.env.AUTH_PASSWORD || 'password' },
  challenge: true,
});

app.use(express.json());
app.use(auth);

// Load system prompt
let systemPrompt: string;

async function loadSystemPrompt() {
  try {
    systemPrompt = await fs.readFile('system_prompt.txt', 'utf-8');
  } catch (error) {
    console.error('Failed to load system prompt:', error);
    process.exit(1);
  }
}

// Endpoint for chat interaction
app.post('/chat', async (req, res) => {
  const { messages, systemPrompt: customSystemPrompt } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Valid messages array is required' });
  }

  try {
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: messages,
      system: customSystemPrompt || systemPrompt,
      stream: true,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let buffer = '';
    let inBrackets = false;
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && 'text' in chunk.delta && chunk.delta.text) {
        const text = chunk.delta.text;
        for (let i = 0; i < text.length; i++) {
          if (text[i] === '[') {
            if (buffer) {
              res.write(`data: ${JSON.stringify({ text: buffer })}\n\n`);
              buffer = '';
            }
            inBrackets = true;
          }

          buffer += text[i];

          if (text[i] === ']' && inBrackets) {
            res.write(`data: ${JSON.stringify({ text: buffer })}\n\n`);
            buffer = '';
            inBrackets = false;
          }
        }

        if (!inBrackets && buffer) {
          res.write(`data: ${JSON.stringify({ text: buffer })}\n\n`);
          buffer = '';
        }
      }
    }
    // Send any remaining buffer content
    if (buffer) {
      res.write(`data: ${JSON.stringify({ text: buffer })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error interacting with Anthropic API:', error);
    res.status(500).json({ error: 'Failed to process the request' });
  }
});

// Endpoint to fetch system prompt
app.get('/system-prompt', (req, res) => {
  res.json({ systemPrompt });
});

// Start the server
async function startServer() {
  await loadSystemPrompt();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();
