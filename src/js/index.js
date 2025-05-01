/**
 * Cleaning Service Quote Bot - Main Entry Point
 * This file initializes the chat bot and exposes the global API
 */

import { Controller } from './controller.js';

// Create a global namespace for the chat bot
window.CleaningQuoteBot = (() => {
  let controller = null;
  
  /**
   * Initialize the chat bot with configuration options
   * @param {Object} config - Configuration options
   */
  function init(config) {
    if (controller) {
      console.warn('CleaningQuoteBot is already initialized. Call reset() first if you want to reinitialize.');
      return;
    }
    
    try {
      controller = new Controller(config);
      controller.initialize();
      console.log('CleaningQuoteBot initialized successfully');
    } catch (error) {
      console.error('Failed to initialize CleaningQuoteBot:', error);
    }
  }
  
  /**
   * Reset the chat bot to its initial state
   */
  function reset() {
    if (controller) {
      controller.reset();
      console.log('CleaningQuoteBot reset successfully');
    }
  }
  
  /**
   * Set a configuration option
   * @param {string} option - Option name
   * @param {any} value - Option value
   */
  function setOption(option, value) {
    if (controller) {
      controller.setOption(option, value);
      console.log(`CleaningQuoteBot option "${option}" set to:`, value);
    }
  }
  
  /**
   * Open the chat bot (if it's in a minimized state)
   */
  function open() {
    if (controller) {
      controller.open();
    }
  }
  
  /**
   * Minimize the chat bot
   */
  function minimize() {
    if (controller) {
      controller.minimize();
    }
  }
  
  // Public API
  return {
    init,
    reset,
    setOption,
    open,
    minimize
  };
})();

// Auto-initialize if data attributes are present
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-cqb-container]');
  
  containers.forEach(container => {
    const config = {
      containerId: container.id,
      apiKey: container.getAttribute('data-cqb-api-key'),
      theme: {
        primaryColor: container.getAttribute('data-cqb-primary-color'),
        secondaryColor: container.getAttribute('data-cqb-secondary-color')
      }
    };
    
    // Only initialize if required attributes are present
    if (config.containerId && config.apiKey) {
      window.CleaningQuoteBot.init(config);
    }
  });
});
