# Krkn Chatbot API

Backend API service for the Krkn documentation chatbot, providing AI-powered responses based on the Krkn chaos engineering documentation.

## Features

- **AI-Powered Responses**: Integration with Google Gemini, OpenAI, or Anthropic APIs
- **Documentation Search**: Intelligent search through Krkn documentation
- **Rate Limiting**: Built-in rate limiting and daily usage limits
- **Security**: CORS protection, request validation, and security headers
- **Logging**: Comprehensive logging for monitoring and debugging

## Quick Start

1. **Install Dependencies**
   ```bash
   cd api
   npm install
   ```

2. **Configure Environment**
   ```bash
   # For Netlify Functions: Set environment variables in Netlify dashboard
   # For local development: Create .env file with required variables
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

## API Endpoints

- `POST /api/chat` - Process chat messages with AI assistance
- `GET /api/health` - Health check and usage statistics  
- `GET /api/search` - Search documentation
- `GET /api/topics` - Get available documentation topics

## Configuration

For **Netlify Functions deployment**, set these environment variables in your Netlify dashboard:

### Required
- `LLM_API_KEY` - API key for your chosen LLM provider

### Optional
- `LLM_PROVIDER` - AI provider (`gemini`, `openai`, `anthropic`) - default: `gemini`
- `LLM_MODEL` - AI model name - default: `gemini-2.5-flash`
- `PORT` - Server port - default: `3001`
- `DAILY_CHAT_LIMIT` - Daily request limit - default: `100`
- `ALLOWED_ORIGINS` - CORS allowed origins - default: localhost origins

## Rate Limiting

- **Short-term**: 20 requests per 5 minutes per IP
- **Daily**: 100 requests per day (configurable)
- **General API**: 100 requests per 15 minutes per IP

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure appropriate `ALLOWED_ORIGINS`
3. Set a secure `LLM_API_KEY`
4. Monitor logs and usage via `/api/health`

## Fallback Mode

Without a valid API key, the chatbot operates in fallback mode, providing static responses with documentation links.