# JADE: The Job-Ad Description Editor

A prototype tool that uses an LLM to help with the drafting of job descriptions.

## Quick Start

To start the backend server, you will first need a valid key for the Anthropic API.

```bash
cd backend
echo ANTHROPIC_API_KEY=<your-key-here> > .env
yarn install
yarn start # or yarn dev
```

Starting the frontend server:

```bash
cd frontend
yarn install
yarn start # or yarn dev
```
