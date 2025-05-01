/**
 * Cleaning Service Quote Bot - API Client
 * This file handles communication with the MaidCentral API
 */

import { createEventEmitter } from '../utils/helpers.js';
import { API_ACTIONS } from '../utils/config.js';
import { mockAPI } from './mock-api.js';

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
   */
  async executeAction(action, params) {
    try {
      // If using mock API, use that instead
      if (this.config.useMockApi) {
        this.handleMockAPI(action, params);
        return;
      }
      
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
      console.error(`Error executing API action ${action}:`, error);
      this.emit('error', error);
    }
  }
  
  /**
   * Handle mock API requests
   * @param {string} action - API action to execute
   * @param {Object} params - Parameters for the action
   */
  async handleMockAPI(action, params) {
    try {
      // Get mock response
      const response = await mockAPI(action, params, this.config.testScenario);
      
      // Emit response event
      this.emit('response', response);
    } catch (error) {
      console.error(`Error with mock API for action ${action}:`, error);
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
      const response = await fetch(`${this.config.apiUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: this.config.apiKey,
          password: this.config.apiKey,
          grant_type: 'password'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store token and expiry
      this.token = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
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
      const url = `${this.config.apiUrl}${endpoint}`;
      
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
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
      const response = await this.request(`/api/lead/postalCodes?postalCode=${postalCode}`);
      this.emit('response', response);
    } catch (error) {
      console.error('Error validating postal code:', error);
      this.emit('error', error);
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
}
