/**
 * Cleaning Service Quote Bot - State Manager
 * This file manages the conversation state and flow
 */

import { createEventEmitter, getStorageItem, setStorageItem } from '../utils/helpers.js';
import { STATES, API_ACTIONS, INPUT_TYPES, VALIDATION_TYPES } from '../utils/config.js';
import { conversationFlow } from './conversation.js';

export class StateManager {
  /**
   * Create a new StateManager instance
   * @param {Object} config - Configuration options
   */
  constructor(config) {
    this.config = config;
    this.currentState = null;
    this.conversationData = {
      postalCode: null,
      postalCodeData: null,
      selectedService: null,
      homeDetails: {},
      pricing: null,
      contactInfo: null,
      leadId: null,
      quoteId: null,
      bookingDate: null
    };
    
    // Create event emitter
    const emitter = createEventEmitter();
    this.on = emitter.on;
    this.off = emitter.off;
    this.emit = emitter.emit;
    
    // Load saved state if available
    if (config.useLocalStorage) {
      this.loadState();
    }
  }
  
  /**
   * Start the conversation
   */
  startConversation() {
    // If we have a saved state, resume from there
    if (this.currentState) {
      this.processState(this.currentState);
      return;
    }
    
    // Otherwise, start from the beginning
    this.transitionToState(STATES.WELCOME);
  }
  
  /**
   * Process user input
   * @param {Object} inputData - User input data
   */
  processUserInput(inputData) {
    // Get current state handler
    const stateHandler = conversationFlow[this.currentState];
    
    if (!stateHandler || !stateHandler.handleInput) {
      console.error(`No input handler for state: ${this.currentState}`);
      return;
    }
    
    try {
      // Call input handler for current state
      const result = stateHandler.handleInput(inputData, this.conversationData);
      
      // Update conversation data
      if (result.data) {
        Object.assign(this.conversationData, result.data);
      }
      
      // Save state
      if (this.config.useLocalStorage) {
        this.saveState();
      }
      
      // Transition to next state if provided
      if (result.nextState) {
        this.transitionToState(result.nextState);
      }
    } catch (error) {
      console.error('Error processing user input:', error);
      this.handleError(error);
    }
  }
  
  /**
   * Process API response
   * @param {Object} response - API response data
   */
  processAPIResponse(response) {
    // Get current state handler
    const stateHandler = conversationFlow[this.currentState];
    
    if (!stateHandler || !stateHandler.handleAPIResponse) {
      console.error(`No API response handler for state: ${this.currentState}`);
      return;
    }
    
    try {
      // Call API response handler for current state
      const result = stateHandler.handleAPIResponse(response, this.conversationData);
      
      // Update conversation data
      if (result.data) {
        Object.assign(this.conversationData, result.data);
      }
      
      // Save state
      if (this.config.useLocalStorage) {
        this.saveState();
      }
      
      // Transition to next state if provided
      if (result.nextState) {
        this.transitionToState(result.nextState);
      }
    } catch (error) {
      console.error('Error processing API response:', error);
      this.handleError(error);
    }
  }
  
  /**
   * Handle error
   * @param {Error} error - Error object
   */
  handleError(error) {
    // Transition to error state
    this.transitionToState(STATES.ERROR, {
      error: error.message || 'An unexpected error occurred'
    });
  }
  
  /**
   * Transition to a new state
   * @param {string} state - New state
   * @param {Object} additionalData - Additional data for the state
   */
  transitionToState(state, additionalData = {}) {
    // Update current state
    this.currentState = state;
    
    // Update conversation data with additional data
    if (additionalData) {
      Object.assign(this.conversationData, additionalData);
    }
    
    // Save state
    if (this.config.useLocalStorage) {
      this.saveState();
    }
    
    // Process the new state
    this.processState(state);
  }
  
  /**
   * Process a state
   * @param {string} state - State to process
   */
  processState(state) {
    // Get state handler
    const stateHandler = conversationFlow[state];
    
    if (!stateHandler || !stateHandler.enter) {
      console.error(`No handler for state: ${state}`);
      return;
    }
    
    try {
      // Call enter handler for state
      const result = stateHandler.enter(this.conversationData, this.config);
      
      // Emit state change event
      this.emit('stateChange', result);
      
      // Update conversation data
      if (result.data) {
        Object.assign(this.conversationData, result.data);
        
        // Save state
        if (this.config.useLocalStorage) {
          this.saveState();
        }
      }
      
      // Transition to next state if provided
      if (result.nextState) {
        this.transitionToState(result.nextState);
      }
    } catch (error) {
      console.error(`Error processing state ${state}:`, error);
      this.handleError(error);
    }
  }
  
  /**
   * Save state to local storage
   */
  saveState() {
    try {
      const stateData = {
        currentState: this.currentState,
        conversationData: this.conversationData
      };
      
      setStorageItem('state', stateData, this.config.storagePrefix);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }
  
  /**
   * Load state from local storage
   */
  loadState() {
    try {
      const stateData = getStorageItem('state', this.config.storagePrefix);
      
      if (stateData) {
        this.currentState = stateData.currentState;
        this.conversationData = stateData.conversationData;
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }
  
  /**
   * Reset the state
   */
  reset() {
    // Reset current state
    this.currentState = null;
    
    // Reset conversation data
    this.conversationData = {
      postalCode: null,
      postalCodeData: null,
      selectedService: null,
      homeDetails: {},
      pricing: null,
      contactInfo: null,
      leadId: null,
      quoteId: null,
      bookingDate: null
    };
    
    // Remove saved state
    if (this.config.useLocalStorage) {
      try {
        localStorage.removeItem(`${this.config.storagePrefix}state`);
      } catch (error) {
        console.error('Error removing saved state:', error);
      }
    }
    
    // Start conversation from beginning
    this.startConversation();
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
