/**
 * Cleaning Service Quote Bot - Main Controller
 * This file coordinates between UI, state management, and API client
 */

import { UIManager } from './ui/ui-manager.js';
import { StateManager } from './state/state-manager.js';
import { APIClient } from './api/api-client.js';
import { defaultConfig } from './utils/config.js';
import { mergeObjects } from './utils/helpers.js';

export class Controller {
  /**
   * Create a new Controller instance
   * @param {Object} config - User configuration
   */
  constructor(config = {}) {
    // Merge user config with default config
    this.config = mergeObjects(defaultConfig, config);
    
    // Initialize components
    this.api = new APIClient(this.config);
    this.state = new StateManager(this.config);
    this.ui = new UIManager(this.config);
    
    // Bind methods
    this.handleUserInput = this.handleUserInput.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleAPIResponse = this.handleAPIResponse.bind(this);
    this.handleError = this.handleError.bind(this);
  }
  
  /**
   * Initialize the chat bot
   */
  initialize() {
    // Set up event listeners
    this.ui.on('userInput', this.handleUserInput);
    this.state.on('stateChange', this.handleStateChange);
    this.api.on('response', this.handleAPIResponse);
    this.api.on('error', this.handleError);
    
    // Initialize UI
    this.ui.initialize(this.config.containerId);
    
    // Initialize API
    this.api.initialize();
    
    // Start conversation
    this.state.startConversation();
  }
  
  /**
   * Reset the chat bot to its initial state
   */
  reset() {
    this.state.reset();
    this.ui.reset();
  }
  
  /**
   * Set a configuration option
   * @param {string} option - Option name
   * @param {any} value - Option value
   */
  setOption(option, value) {
    this.config[option] = value;
    
    // Update components with new config
    this.api.updateConfig({ [option]: value });
    this.state.updateConfig({ [option]: value });
    this.ui.updateConfig({ [option]: value });
    
    // Special handling for certain options
    if (option === 'testScenario') {
      this.reset();
    }
  }
  
  /**
   * Open the chat bot
   */
  open() {
    this.ui.open();
  }
  
  /**
   * Minimize the chat bot
   */
  minimize() {
    this.ui.minimize();
  }
  
  /**
   * Handle user input from the UI
   * @param {Object} data - Input data
   */
  handleUserInput(data) {
    // Process user input through state manager
    this.state.processUserInput(data);
  }
  
  /**
   * Handle state changes from the state manager
   * @param {Object} stateData - New state data
   */
  handleStateChange(stateData) {
    console.log(`[Controller] Handling state change:`, stateData);
    
    // Update UI based on state change
    this.ui.updateFromState(stateData);
    
    // Make API calls if needed
    if (stateData.apiAction) {
      console.log(`[Controller] Executing API action: ${stateData.apiAction} with params:`, stateData.apiParams);
      this.api.executeAction(stateData.apiAction, stateData.apiParams);
    } else {
      console.log(`[Controller] No API action to execute`);
    }
  }
  
  /**
   * Handle API responses
   * @param {Object} response - API response data
   */
  handleAPIResponse(response) {
    console.log(`[Controller] Received API response:`, response);
    
    // Process API response through state manager
    console.log(`[Controller] Forwarding API response to state manager`);
    this.state.processAPIResponse(response);
  }
  
  /**
   * Handle errors from any component
   * @param {Error} error - Error object
   */
  handleError(error) {
    console.error('CleaningQuoteBot error:', error);
    
    // Update state with error
    this.state.handleError(error);
    
    // Show error in UI
    this.ui.showError(error.message || 'An unexpected error occurred');
  }
}
