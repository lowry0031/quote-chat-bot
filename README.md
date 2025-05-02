# Cleaning Service Quote Bot

A customizable, embeddable chat bot for getting quotes for home cleaning services.

## Features

- Interactive chat interface for collecting user information
- Integration with MaidCentral API for pricing and booking
- Customizable themes and behavior
- Responsive design for mobile and desktop
- API logging for debugging

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/quote-chat-bot.git
cd quote-chat-bot

# Install dependencies
npm install
```

## Usage

### Development

To start the development server:

```bash
npm start
```

This will start the server at http://localhost:8080. The server includes:
- Static file serving
- API logging endpoint
- Proxy for MaidCentral API requests to avoid CORS issues

To use the static file server without the API proxy:

```bash
npm run start:static
```

To build the project for development with source maps:

```bash
npm run dev
```

### Production

To build the project for production:

```bash
npm run build
```

This will create minified files in the `dist` directory.

## Configuration

The chat bot can be configured with various options:

```javascript
CleaningQuoteBot.init({
  containerId: 'chat-container',
  username: 'YOUR_USERNAME',
  password: 'YOUR_PASSWORD',
  theme: {
    primaryColor: '#4a90e2',
    secondaryColor: '#f5a623'
  },
  apiLogging: {
    enabled: true,
    logRequests: true,
    logResponses: true
  }
});
```

## Troubleshooting

### API Errors

If you encounter API errors:

1. Check that your API credentials are correct
2. Make sure you're using the custom server with the API proxy by running `npm start`
3. Check the API logs in the `api-logs` directory for detailed error information

### CORS Issues

The application includes a proxy server to handle CORS issues when developing locally. If you're still experiencing CORS problems:

1. Make sure you're using the custom server by running `npm start` instead of `npm run start:static`
2. Check that the proxy is correctly configured in the server.js file
3. Verify that the API client is using the proxy URL when running locally

## License

MIT
