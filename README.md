# AI Chatbot Chrome Extension

A Chrome extension that provides a draggable chatbot interface for any OpenAI-compatible API. Connect to OpenAI, Perplexity, or any other compatible service for AI conversations while browsing.

## What It Does

This extension adds an AI chatbot to your browser

## Features

- 🤖 **OpenAI-Compatible**: Works with OpenAI API, Perplexity, or any compatible service
- 💬 **Chat History**: Saves conversations in your browser
- 📝 **Text Selection**: Quick chat from selected text
- 🎯 **Keyboard Shortcuts**: `Cmd/Ctrl + I` to open, `Escape` to close
- 🖱️ **Draggable UI**: Move the chat window around
- 💾 **Local Storage**: Conversations saved in your browser
- ⚡ **Streaming**: See responses as they come in
- 🎨 **Simple UI**: Clean interface built with React and Tailwind

## Requirements

- **Browser**: Chrome (or similar)
- **Node.js**: Version 18+
- **API Key**: You'll need an API key from your chosen service

## How It Works

The extension has three parts:

1. **Content Script**: Runs on web pages and shows the chat interface
2. **Background Script**: Handles API calls and saves conversations
3. **Popup**: Where you configure your API settings

When you chat:
1. You type a message and hit enter
2. The extension sends it to your configured API
3. You get a response back
4. The conversation is saved for later

## Setup

### 1. Get the Code

```bash
git clone <repository-url>
cd search
npm install
```

### 2. Set Up Your API

1. Get an API key from your chosen service:
   - [OpenAI](https://platform.openai.com/api-keys)
   - [Perplexity](https://www.perplexity.ai/settings/api)
   - [DeepSeek](https://platform.deepseek.com/api-keys)
   - Or any other OpenAI-compatible API
2. Run `npm run dev`
3. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Turn on "Developer mode"
   - Click "Load unpacked" and pick the `dist` folder
4. Click the extension icon
5. Add your API key and configure your endpoint

### 3. Start Building

```bash
npm run dev
```

## How to Use

### Basic Chat
1. Go to any website
2. Press `Cmd/Ctrl + I`
3. Type your message and press Enter
4. Read the response

### Chat About Selected Text
1. Select some text on a page
2. Press `Cmd/Ctrl + I`
3. The text will be in the chat box
4. Edit it or just press Enter

### Manage Chats
- **New Chat**: Just start typing
- **Switch Chats**: Use the dropdown to pick a saved conversation
- **Delete Chats**: Click the trash icon next to chat names
- **Close**: Press `Escape` or click the X

## Development

### Project Structure
```
src/
├── background/          # API calls and storage
├── components/          # React components
├── content/            # Runs on web pages
├── popup/              # Settings page
├── lib/                # Helper functions
├── hooks/              # React hooks
└── consts/             # Configuration
```

### Commands
- `npm run dev` - Start development
- `npm run build` - Build for production
- `npm run preview` - Test the build

## Configuration

### API Settings
- **API Key**: Your API key (required)
- **Model**: Which AI model to use
- **Base URL**: API endpoint (configure for your service)
- **Max History**: How many messages to keep

### Supported Services
- **OpenAI**: Use `https://api.openai.com/v1` as base URL
- **Perplexity**: Use `https://api.perplexity.ai` as base URL
- **DeepSeek**: Use `https://api.deepseek.com/v1` as base URL
- **Custom**: Any OpenAI-compatible API endpoint

### Permissions
The extension needs:
- `storage` - To save your chats
- `activeTab` - To read the current page
- `tabs` - To communicate between parts

## Troubleshooting

### Common Problems
1. **Extension won't load**: Make sure Developer mode is on
2. **API errors**: Check your API key and endpoint configuration
3. **Chat window doesn't appear**: Try refreshing the page
4. **Chats not saving**: Check if storage is working

### Debug
Open Chrome DevTools and check the Console for error messages.

## Notes

This is a personal project I built in about 4 days. It's not perfect, but it works for my needs. Feel free to use it, modify it, or learn from it.

## License

MIT License - do whatever you want with it.
