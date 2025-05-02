/**
 * Cleaning Service Quote Bot - Default Configuration
 * This file contains default configuration settings
 */

export const defaultConfig = {
  // API Configuration
  apiKey: null, // Deprecated: Use username and password instead
  username: 'MC.d73b8216c04b51899f0c037f6422ed35',
  password: 'b93ca66fe45a4fc3aa374689368b',
  apiUrl: 'https://api.maidcentral.net',
  useMockApi: false,
  
  // UI Configuration
  containerId: null,
  theme: {
    primaryColor: '#4a90e2',
    secondaryColor: '#f5a623',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    fontSize: '14px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  },
  
  // Behavior Configuration
  autoOpen: false, // Start minimized by default
  welcomeMessage: 'Hi! I can help you get a quote for our cleaning services. To get started, please enter your postal code.',
  inputPlaceholder: 'Type your response...',
  
  // Test Configuration
  testScenario: 'default',
  
  // Callbacks
  onInit: null,
  onLeadCreated: null,
  onQuoteCreated: null,
  onBookingComplete: null,
  
  // Advanced Configuration
  debug: true,
  pollingInterval: 5000, // 5 seconds
  maxRetries: 3,
  storagePrefix: 'cqb_',
  useLocalStorage: true,
  
  // API Logging Configuration
  apiLogging: {
    enabled: true,
    logDirectory: './api-logs',
    logRequests: true,
    logResponses: true,
    maxLogFiles: 100
  }
};

// Conversation states
export const STATES = {
  WELCOME: 'welcome',
  POSTAL_CODE_ENTRY: 'postalCodeEntry',
  VALIDATING_POSTAL_CODE: 'validatingPostalCode',
  SERVICE_UNAVAILABLE: 'serviceUnavailable',
  SERVICE_SELECTION: 'serviceSelection',
  HOME_QUESTIONS: 'homeQuestions',
  PRICING_CALCULATION: 'pricingCalculation',
  PRICING_DISPLAY: 'pricingDisplay',
  CONTACT_COLLECTION: 'contactCollection',
  LEAD_CREATION: 'leadCreation',
  QUOTE_CREATION: 'quoteCreation',
  QUOTE_SUMMARY: 'quoteSummary',
  BOOKING_OPTION: 'bookingOption',
  DATE_SELECTION: 'dateSelection',
  BOOKING_CONFIRMATION: 'bookingConfirmation',
  THANK_YOU: 'thankYou',
  ERROR: 'error'
};

// API actions
export const API_ACTIONS = {
  VALIDATE_POSTAL_CODE: 'validatePostalCode',
  GET_SCOPE_GROUPS: 'getScopeGroups',
  GET_SCOPES: 'getScopes',
  GET_QUESTIONS: 'getQuestions',
  GET_RATE_MODIFICATIONS: 'getRateModifications',
  GET_PRICING: 'getPricing',
  CREATE_LEAD: 'createLead',
  CREATE_QUOTE: 'createQuote',
  GET_AVAILABILITY: 'getAvailability',
  BOOK_QUOTE: 'bookQuote'
};

// Input types
export const INPUT_TYPES = {
  TEXT: 'text',
  OPTIONS: 'options',
  FORM: 'form',
  DATE: 'date'
};

// Validation types
export const VALIDATION_TYPES = {
  POSTAL_CODE: 'postalCode',
  EMAIL: 'email',
  PHONE: 'phone',
  REQUIRED: 'required'
};
