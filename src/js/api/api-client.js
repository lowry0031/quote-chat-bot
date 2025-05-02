/**
 * Cleaning Service Quote Bot - API Client
 * This file handles communication with the MaidCentral API
 */

import { createEventEmitter, logApiData } from '../utils/helpers.js';
import { API_ACTIONS } from '../utils/config.js';

export class APIClient {
  /**
   * Create a new APIClient instance
   * @param {Object} config - Configuration options
   */
  constructor(config) {
    this.config = config;
    this.token = null;
    this.tokenExpiry = null;
    
    // Create event emitter
    const emitter = createEventEmitter();
    this.on = emitter.on;
    this.off = emitter.off;
    this.emit = emitter.emit;
  }
  
  /**
   * Initialize the API client
   */
  initialize() {
    // Nothing to do here for now
  }
  
  /**
   * Execute an API action
   * @param {string} action - API action to execute
   * @param {Object} params - Parameters for the action
   * @param {number} retryCount - Number of retry attempts (internal use)
   */
  async executeAction(action, params, retryCount = 0) {
    try {
      // Make sure we have a token
      await this.ensureToken();
      
      // Execute the appropriate action
      switch (action) {
        case API_ACTIONS.VALIDATE_POSTAL_CODE:
          await this.validatePostalCode(params.postalCode);
          break;
        case API_ACTIONS.GET_SCOPE_GROUPS:
          await this.getScopeGroups();
          break;
        case API_ACTIONS.GET_SCOPES:
          await this.getScopes(params.scopeGroupId);
          break;
        case API_ACTIONS.GET_QUESTIONS:
          await this.getQuestions(params.scopeIds);
          break;
        case API_ACTIONS.GET_RATE_MODIFICATIONS:
          await this.getRateModifications(params.scopeId);
          break;
        case API_ACTIONS.GET_PRICING:
          await this.getPricing(params);
          break;
        case API_ACTIONS.CREATE_LEAD:
          await this.createLead(params);
          break;
        case API_ACTIONS.CREATE_QUOTE:
          await this.createQuote(params);
          break;
        case API_ACTIONS.GET_AVAILABILITY:
          await this.getAvailability(params);
          break;
        case API_ACTIONS.BOOK_QUOTE:
          await this.bookQuote(params);
          break;
        default:
          throw new Error(`Unknown API action: ${action}`);
      }
    } catch (error) {
      // Check if this is an authentication error and we haven't exceeded max retries
      if ((error.message.includes('Authentication failed') || error.message.includes('permission')) && 
          retryCount < this.config.maxRetries) {
        console.warn(`Authentication error, retrying (${retryCount + 1}/${this.config.maxRetries})...`);
        
        // Clear token to force re-authentication
        this.token = null;
        this.tokenExpiry = null;
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retry the action with incremented retry count
        return this.executeAction(action, params, retryCount + 1);
      }
      
      // If we've exceeded retries or it's not an authentication error, emit the error
      console.error(`Error executing API action ${action}:`, error);
      this.emit('error', error);
    }
  }
  
  
  /**
   * Ensure we have a valid token
   */
  async ensureToken() {
    // If we have a token and it's not expired, use it
    if (this.token && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      return;
    }
    
    // Otherwise, get a new token
    await this.authenticate();
  }
  
  /**
   * Authenticate with the API
   */
  async authenticate() {
    try {
      // Determine username and password
      // For backward compatibility, use apiKey if username/password not provided
      const username = this.config.username || this.config.apiKey;
      const password = this.config.password || this.config.apiKey;

      console.log('Username:', username);
      console.log('Password:', password);
      
      if (!username || !password) {
        throw new Error('Authentication failed: No username/password or apiKey provided');
      }
      
      // Use proxy URL if we're running locally
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // For token endpoint, we need to use the /proxy/api path locally
      const baseUrl = isLocalhost ? '/proxy/api' : this.config.apiUrl;
      const url = `${baseUrl}/token`;
      const requestBody = new URLSearchParams({
        username,
        password,
        grant_type: 'password'
      });
      
      // Log authentication request (mask password for security)
      const requestData = {
        url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: {
          username,
          password: '********', // Mask password
          grant_type: 'password'
        }
      };
      logApiData('request', 'authenticate', requestData, this.config);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
      });
      
      if (!response.ok) {
        // Handle specific authentication errors
        if (response.status === 401) {
          throw new Error('Authentication failed: Invalid username or password. Please check your credentials.');
        } else if (response.status === 403) {
          throw new Error('Authentication failed: You do not have permission to access this resource.');
        } else {
          throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      // Log authentication response (mask token for security)
      const responseData = {
        ...data,
        access_token: data.access_token ? '********' : null // Mask token
      };
      logApiData('response', 'authenticate', responseData, this.config);
      
      // Store token and expiry
      this.token = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      
      if (this.config.debug) {
        console.log('Authentication successful, token expires in', data.expires_in, 'seconds');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }
  
  /**
   * Make an API request
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, method = 'GET', data = null) {
    try {
      // Use proxy URL if we're running locally
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // For local development, we need to handle the URL construction differently
      // The proxy expects the full path including /api
      let baseUrl = isLocalhost ? '/proxy/api' : this.config.apiUrl;
      let url = `${baseUrl}${endpoint}`;
      // Always use /proxy/api for local requests, as the server only proxies /proxy/api/*
      
      console.log(`Making API request to: ${url}`);
      
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
        }
      };
      // Only set Content-Type and body for POST/PUT with data
      if (data && (method === 'POST' || method === 'PUT')) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
      }
      
      // Determine API action from endpoint
      const action = this.getActionFromEndpoint(endpoint);
      
      // Log request
      const requestData = {
        url,
        method,
        headers: options.headers,
        body: data
      };
      logApiData('request', action, requestData, this.config);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        console.error(`API request failed`);
        console.error(response);
        // Handle specific error codes
        if (response.status === 401 || response.status === 403) {
          // Authentication or authorization error
          this.token = null; // Clear the token to force re-authentication
          this.tokenExpiry = null;
          throw new Error(`Authentication failed: You do not have permission to access this resource. Please check your credentials.`);
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
      }
      
      const responseData = await response.json();
      
      // Log response
      logApiData('response', action, responseData, this.config);
      
      return responseData;
    } catch (error) {
      console.error(`API request error (${endpoint}):`, error);
      throw error;
    }
  }
  
  /**
   * Validate a postal code
   * @param {string} postalCode - Postal code to validate
   */
  async validatePostalCode(postalCode) {
    try {
      const response = await this.request(`/api/Lead/PostalCodes`);
      
      // Transform the response to match the expected format
      // The API returns an array of postal codes, but the app expects a single object
      const transformedResponse = { ...response };
      
      // Find the matching postal code in the result array
      const matchingPostalCode = response.Result.find(pc => pc.PostalCode === postalCode);
      
      if (matchingPostalCode) {
        // Transform the response to match the expected format
        transformedResponse.Result = {
          IsValid: true,
          IsServiceAvailable: true, // We consider it available if it's in the list
          PostalCode: matchingPostalCode.PostalCode,
          ZoneName: matchingPostalCode.ZoneName,
          ZoneId: matchingPostalCode.ZoneId,
          City: matchingPostalCode.City || "Your city", // Default if not provided
          Region: matchingPostalCode.Region || matchingPostalCode.ZoneName, // Use ZoneName as fallback
          Notes: matchingPostalCode.Notes || ""
        };
      } else {
        // If postal code not found in the list, it's not available
        transformedResponse.Result = {
          IsValid: true, // It's a valid format, just not serviced
          IsServiceAvailable: false,
          PostalCode: postalCode,
          Notes: "This postal code is not in our service area."
        };
      }
      
      console.log('Transformed postal code response:', transformedResponse);
      this.emit('response', transformedResponse);
    } catch (error) {
      // Check if this is an authentication error
      if (error.message.includes('Authentication failed') || error.message.includes('permission')) {
        // Propagate the error for retry handling in executeAction
        throw error;
      } else {
        console.error('Error validating postal code:', error);
        this.emit('error', error);
      }
    }
  }
  
  /**
   * Get scope groups
   */
  async getScopeGroups() {
    try {
      const response = await this.request('/api/Lead/ScopeGroups');
      this.emit('response', response);
    } catch (error) {
      console.error('Error getting scope groups:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Get scopes for a scope group
   * @param {number} scopeGroupId - Scope group ID
   */
  async getScopes(scopeGroupId) {
    try {
      const response = await this.request(`/api/Lead/Scopes?scopeGroupId=${scopeGroupId}`);
      this.emit('response', response);
    } catch (error) {
      console.error('Error getting scopes:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Get questions for scopes
   * @param {Array} scopeIds - Scope IDs
   */
  async getQuestions(scopeIds) {
    try {
      const queryParams = scopeIds.map(id => `scopeIds=${id}`).join('&');
      const response = await this.request(`/api/Lead/Questions?${queryParams}`);
      this.emit('response', response);
    } catch (error) {
      console.error('Error getting questions:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Get rate modifications for a scope
   * @param {number} scopeId - Scope ID
   */
  async getRateModifications(scopeId) {
    try {
      const response = await this.request(`/api/Lead/RateModifications?scopeId=${scopeId}`);
      this.emit('response', response);
    } catch (error) {
      console.error('Error getting rate modifications:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Get pricing
   * @param {Object} params - Pricing parameters
   */
  async getPricing(params) {
    try {
      const response = await this.request('/api/Lead/GetPricing', 'POST', params);
      this.emit('response', response);
    } catch (error) {
      console.error('Error getting pricing:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Create a lead
   * @param {Object} params - Lead parameters
   */
  async createLead(params) {
    try {
      const response = await this.request('/api/Lead/CreateOrUpdate', 'POST', params);
      this.emit('response', response);
      
      // Call onLeadCreated callback if provided
      if (this.config.onLeadCreated && typeof this.config.onLeadCreated === 'function') {
        this.config.onLeadCreated(response.Result);
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Create a quote
   * @param {Object} params - Quote parameters
   */
  async createQuote(params) {
    try {
      const response = await this.request('/api/Lead/CreateOrUpdateQuote', 'POST', params);
      this.emit('response', response);
      
      // Call onQuoteCreated callback if provided
      if (this.config.onQuoteCreated && typeof this.config.onQuoteCreated === 'function') {
        this.config.onQuoteCreated(response.Result);
      }
    } catch (error) {
      console.error('Error creating quote:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Get availability
   * @param {Object} params - Availability parameters
   */
  async getAvailability(params) {
    try {
      const { scopeGroupId, hours } = params;
      const response = await this.request(`/api/Lead/Availability?scopeGroupId=${scopeGroupId}&hours=${hours}`);
      this.emit('response', response);
    } catch (error) {
      console.error('Error getting availability:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Book a quote
   * @param {Object} params - Booking parameters
   */
  async bookQuote(params) {
    try {
      const response = await this.request('/api/Lead/BookQuote', 'POST', params);
      this.emit('response', response);
      
      // Call onBookingComplete callback if provided
      if (this.config.onBookingComplete && typeof this.config.onBookingComplete === 'function') {
        this.config.onBookingComplete(response.Result);
      }
    } catch (error) {
      console.error('Error booking quote:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Update configuration
   * @param {Object} config - New configuration
   */
  updateConfig(config) {
    // Update config
    Object.assign(this.config, config);
  }
  
  /**
   * Get API action from endpoint
   * @param {string} endpoint - API endpoint
   * @returns {string} API action
   */
  getActionFromEndpoint(endpoint) {
    // Map endpoints to actions
    if (endpoint.includes('/api/Lead/PostalCodes')) {
      return API_ACTIONS.VALIDATE_POSTAL_CODE;
    } else if (endpoint.includes('/api/Lead/ScopeGroups')) {
      return API_ACTIONS.GET_SCOPE_GROUPS;
    } else if (endpoint.includes('/api/Lead/Scopes')) {
      return API_ACTIONS.GET_SCOPES;
    } else if (endpoint.includes('/api/Lead/Questions')) {
      return API_ACTIONS.GET_QUESTIONS;
    } else if (endpoint.includes('/api/Lead/RateModifications')) {
      return API_ACTIONS.GET_RATE_MODIFICATIONS;
    } else if (endpoint.includes('/api/Lead/GetPricing')) {
      return API_ACTIONS.GET_PRICING;
    } else if (endpoint.includes('/api/Lead/CreateOrUpdate')) {
      return API_ACTIONS.CREATE_LEAD;
    } else if (endpoint.includes('/api/Lead/CreateOrUpdateQuote')) {
      return API_ACTIONS.CREATE_QUOTE;
    } else if (endpoint.includes('/api/Lead/Availability')) {
      return API_ACTIONS.GET_AVAILABILITY;
    } else if (endpoint.includes('/api/Lead/BookQuote')) {
      return API_ACTIONS.BOOK_QUOTE;
    } else {
      // Default to endpoint path if no match
      return endpoint.split('?')[0];
    }
  }
}
