# Cleaning Service Quote Chat Bot

A customizable, embeddable chat bot for getting quotes for home cleaning services. This chat bot integrates with the MaidCentral API to provide pricing, create leads, generate quotes, and book services.

## Features

- **Embeddable**: Easily add the chat bot to any website with a simple script tag
- **Customizable**: Configure colors, messages, and behavior to match your brand
- **Responsive**: Works on desktop and mobile devices
- **API Integration**: Connects to the MaidCentral API for real-time pricing and booking
- **Conversation Flow**: Guides users through the quote process with a natural conversation flow

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Integration](#api-integration)
- [Development](#development)
- [Testing](#testing)
- [Customization](#customization)
- [API Logging](#api-logging)
- [Browser Compatibility](#browser-compatibility)
- [License](#license)

## Installation

### Option 1: CDN (Recommended)

Add the following code to your HTML:

```html
<!-- Add the chat bot container -->
<div id="chat-container"></div>

<!-- Add the chat bot script -->
<link rel="stylesheet" href="https://cdn.example.com/chatbot.min.css">
<script src="https://cdn.example.com/chatbot.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    CleaningQuoteBot.init({
      containerId: 'chat-container',
      username: 'YOUR_USERNAME',
      password: 'YOUR_PASSWORD',
      theme: {
        primaryColor: '#4a90e2',
        secondaryColor: '#f5a623'
      }
    });
  });
</script>
```

### Option 2: Self-hosted

1. Download the latest release from the [releases page](https://github.com/example/cleaning-quote-bot/releases)
2. Extract the files to your web server
3. Add the following code to your HTML:

```html
<!-- Add the chat bot container -->
<div id="chat-container"></div>

<!-- Add the chat bot script -->
<link rel="stylesheet" href="path/to/chatbot.min.css">
<script src="path/to/chatbot.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    CleaningQuoteBot.init({
      containerId: 'chat-container',
      username: 'YOUR_USERNAME',
      password: 'YOUR_PASSWORD',
      theme: {
        primaryColor: '#4a90e2',
        secondaryColor: '#f5a623'
      }
    });
  });
</script>
```

### Option 3: Data Attributes

You can also initialize the chat bot using data attributes:

```html
<!-- Add the chat bot container -->
<div id="chat-container" data-cqb-container data-cqb-username="YOUR_USERNAME" data-cqb-password="YOUR_PASSWORD" data-cqb-primary-color="#4a90e2" data-cqb-secondary-color="#f5a623"></div>

<!-- Add the chat bot script -->
<link rel="stylesheet" href="path/to/chatbot.min.css">
<script src="path/to/chatbot.min.js"></script>
```

## Usage

The chat bot will automatically start when the page loads. It will guide users through the following process:

1. Enter postal code to check service availability
2. Select service type (residential, commercial, etc.)
3. Answer questions about their home (bedrooms, bathrooms, etc.)
4. View pricing options
5. Enter contact information
6. Create a quote
7. Optionally book a service

## Configuration

The chat bot can be configured with the following options:

```javascript
CleaningQuoteBot.init({
  // Required
  containerId: 'chat-container', // ID of the container element
  username: 'YOUR_USERNAME',     // MaidCentral API username
  password: 'YOUR_PASSWORD',     // MaidCentral API password
  
  // API Configuration
  apiUrl: 'https://api.maidcentral.com', // API base URL
  
  // UI Configuration
  theme: {
    primaryColor: '#4a90e2',            // Primary brand color
    secondaryColor: '#f5a623',          // Secondary color
    fontFamily: 'Arial, sans-serif',    // Font family
    fontSize: '14px',                   // Base font size
    borderRadius: '8px',                // Border radius for elements
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)' // Shadow for chat container
  },
  
  // Behavior Configuration
  autoOpen: false,                        // Auto-open chat on page load
  welcomeMessage: 'Hi! Need a cleaning quote?', // Initial message
  inputPlaceholder: 'Type your response...', // Placeholder for text input
  
  // Callbacks
  onInit: function() {},                  // Called after initialization
  onLeadCreated: function(leadData) {},   // Called when lead is created
  onQuoteCreated: function(quoteData) {}, // Called when quote is created
  onBookingComplete: function(bookingData) {}, // Called after booking
  
  // Advanced Configuration
  debug: false,                        // Enable debug logging to console
  pollingInterval: 5000,               // Polling interval for long-running operations
  maxRetries: 3,                       // Maximum number of retry attempts
  storagePrefix: 'cqb_',               // Prefix for localStorage keys
  useLocalStorage: true,               // Use localStorage for state persistence
  
  // API Logging Configuration
  apiLogging: {
    enabled: false,                    // Enable API logging
    logRequests: true,                 // Log API requests
    logResponses: true                 // Log API responses
  }
});
```

## API Integration

The chat bot integrates with the MaidCentral API to provide real-time pricing, create leads, generate quotes, and book services. You'll need MaidCentral API credentials (username and password) to use these features.

### API Endpoints Used

- `/api/lead/postalCodes` - Validate postal code and check service availability
- `/api/Lead/ScopeGroups` - Get available service types
- `/api/Lead/Questions` - Get questions for selected services
- `/api/Lead/GetPricing` - Get pricing for selected services
- `/api/Lead/CreateOrUpdate` - Create a lead
- `/api/Lead/CreateOrUpdateQuote` - Create a quote
- `/api/Lead/Availability` - Get available service dates
- `/api/Lead/BookQuote` - Book a quote

## Development

### Prerequisites

- Node.js 14+
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone https://github.com/example/cleaning-quote-bot.git
cd cleaning-quote-bot
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open `http://localhost:3000` in your browser

### Build

To build the production version:

```bash
npm run build
```

This will create minified files in the `dist` directory.

## Testing

To test the chat bot, you can use the test page included in the repository:

```bash
npm run test
```

This will start a test server and open a test page in your browser. You can use this page to test the chat bot with different configurations and scenarios.

## Customization

### Themes

You can customize the appearance of the chat bot by setting theme options:

```javascript
CleaningQuoteBot.init({
  containerId: 'chat-container',
  username: 'YOUR_USERNAME',
  password: 'YOUR_PASSWORD',
  theme: {
    primaryColor: '#4a90e2',            // Primary brand color
    secondaryColor: '#f5a623',          // Secondary color
    fontFamily: 'Arial, sans-serif',    // Font family
    fontSize: '14px',                   // Base font size
    borderRadius: '8px',                // Border radius for elements
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)' // Shadow for chat container
  }
});
```

### Messages

You can customize the welcome message:

```javascript
CleaningQuoteBot.init({
  containerId: 'chat-container',
  username: 'YOUR_USERNAME',
  password: 'YOUR_PASSWORD',
  welcomeMessage: 'Hi! Need a cleaning quote?'
});
```

### Callbacks

You can add callbacks for various events:

```javascript
CleaningQuoteBot.init({
  containerId: 'chat-container',
  username: 'YOUR_USERNAME',
  password: 'YOUR_PASSWORD',
  onLeadCreated: function(leadData) {
    console.log('Lead created:', leadData);
    // Track conversion in analytics
    gtag('event', 'lead_created', {
      'event_category': 'chatbot',
      'event_label': leadData.email
    });
  }
});
```

## API Logging

The chat bot includes an API logging feature that can be used for troubleshooting API issues. When enabled, this feature will save API request and response payloads as JSON files, which can be used to diagnose problems with the API integration.

### Enabling API Logging

To enable API logging, add the `apiLogging` configuration option:

```javascript
CleaningQuoteBot.init({
  containerId: 'chat-container',
  username: 'YOUR_USERNAME',
  password: 'YOUR_PASSWORD',
  apiLogging: {
    enabled: true,           // Enable API logging
    logRequests: true,       // Log API requests
    logResponses: true       // Log API responses
  }
});
```

### Log Files

When API logging is enabled, the chat bot will generate JSON log files for each API request and response. These files will be saved to the server in the `api-logs` directory with filenames in the following format:

- `api-log-request-[action]-[timestamp].json` - API request logs
- `api-log-response-[action]-[timestamp].json` - API response logs

Each log file contains:
- Timestamp of the request/response
- Type (request or response)
- API action (e.g., validatePostalCode, createLead)
- Complete payload data

### Security Considerations

For security reasons, sensitive information like passwords and authentication tokens are masked in the log files.

## Browser Compatibility

The chat bot is compatible with the following browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11 (with polyfills)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
