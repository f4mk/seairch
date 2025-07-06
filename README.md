# AI Search Chrome Extension

A simple Chrome extension that lets you search with AI while browsing. It connects to OpenAI's API to provide chat-like search functionality with a draggable interface.

## What It Does

This extension adds AI search to your browser:

- **AI Search**: Ask questions and get responses using OpenAI's API
- **Chat History**: Save conversations locally so you can continue them later
- **Text Selection**: Select text on any page and press `Cmd/Ctrl + I` to search about it
- **Draggable Window**: Move the search window around the screen
- **Multiple Chats**: Start new conversations or continue old ones
- **Real-time Responses**: See AI responses as they're being generated

## Features

- 🤖 **OpenAI Integration**: Uses OpenAI API for responses
- 💬 **Chat History**: Saves conversations in your browser
- 📝 **Text Selection**: Quick search from selected text
- 🎯 **Keyboard Shortcuts**: `Cmd/Ctrl + I` to open, `Escape` to close
- 🖱️ **Draggable UI**: Move the search window around
- 💾 **Local Storage**: Conversations saved in your browser
- ⚡ **Streaming**: See responses as they come in
- 🎨 **Simple UI**: Clean interface built with React and Tailwind

## Requirements

- **Browser**: Chrome (or similar)
- **Node.js**: Version 18+
- **OpenAI API Key**: You'll need this for the AI to work

## How It Works

The extension has three parts:

1. **Content Script**: Runs on web pages and shows the search interface
2. **Background Script**: Handles API calls and saves conversations
3. **Popup**: Where you configure your API settings

When you search:
1. You type a question and hit enter
2. The extension sends it to OpenAI compatible API
3. You get a response back
4. The conversation is saved for later

## Setup

### 1. Get the Code

```bash
git clone <repository-url>
cd search
npm install
```

### 2. Set Up OpenAI

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys) (or any compatible solution)
2. Run `npm run dev`
3. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Turn on "Developer mode"
   - Click "Load unpacked" and pick the `dist` folder
4. Click the extension icon
5. Add your API key and pick a model (like `gpt-3.5-turbo`)

### 3. Start Building

```bash
npm run dev
```

## How to Use

### Basic Search
1. Go to any website
2. Press `Cmd/Ctrl + I`
3. Type your question and press Enter
4. Read the response

### Search Selected Text
1. Select some text on a page
2. Press `Cmd/Ctrl + I`
3. The text will be in the search box
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
- **API Key**: Your OpenAI key (required)
- **Model**: Which AI model to use
- **Base URL**: API endpoint (usually leave as default)
- **Max History**: How many messages to keep

### Permissions
The extension needs:
- `storage` - To save your chats
- `activeTab` - To read the current page
- `tabs` - To communicate between parts

## Troubleshooting

### Common Problems
1. **Extension won't load**: Make sure Developer mode is on
2. **API errors**: Check your API key and model choice
3. **Search window doesn't appear**: Try refreshing the page
4. **Chats not saving**: Check if storage is working

### Debug
Open Chrome DevTools and check the Console for error messages.

## Notes

This is a personal project I built in about 4 days. It's not perfect, but it works for my needs. Feel free to use it, modify it, or learn from it.

## License

MIT License - do whatever you want with it.
