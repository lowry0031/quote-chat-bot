/**
 * Cleaning Service Quote Bot - UI Manager
 * This file handles the user interface for the chat bot
 */

import { createEventEmitter, debounce } from '../utils/helpers.js';
import { INPUT_TYPES } from '../utils/config.js';

export class UIManager {
  /**
   * Create a new UIManager instance
   * @param {Object} config - Configuration options
   */
  constructor(config) {
    this.config = config;
    this.container = null;
    this.elements = {};
    this.isMinimized = false;
    this.isTyping = false;
    
    // Create event emitter
    const emitter = createEventEmitter();
    this.on = emitter.on;
    this.off = emitter.off;
    this.emit = emitter.emit;
    
    // Bind methods
    this.handleUserInput = this.handleUserInput.bind(this);
    this.handleOptionSelect = this.handleOptionSelect.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleDateSelect = this.handleDateSelect.bind(this);
    this.scrollToBottom = debounce(this.scrollToBottom.bind(this), 100);
  }
  
  /**
   * Initialize the UI
   * @param {string} containerId - ID of the container element
   */
  initialize(containerId) {
    // Get container element
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      throw new Error(`Container element with ID "${containerId}" not found`);
    }
    
    // Create chat interface
    this.createChatInterface();
    
    // Apply theme
    this.applyTheme();
    
    // Add event listeners
    this.addEventListeners();
  }
  
  /**
   * Create the chat interface
   */
  createChatInterface() {
    // Clear container
    this.container.innerHTML = '';
    
    // Set container class
    this.container.classList.add('cqb-container');
    
    // Create header
    const header = document.createElement('div');
    header.className = 'cqb-header';
    header.innerHTML = `
      <div class="cqb-header-title">Cleaning Service Quote</div>
      <div class="cqb-header-controls">
        <button class="cqb-header-button cqb-minimize-button">−</button>
      </div>
    `;
    
    // Create messages area
    const messagesArea = document.createElement('div');
    messagesArea.className = 'cqb-messages';
    
    // Create input area
    const inputArea = document.createElement('div');
    inputArea.className = 'cqb-input-area';
    inputArea.innerHTML = `
      <input type="text" class="cqb-input" placeholder="${this.config.inputPlaceholder}">
      <button class="cqb-send-button">Send</button>
    `;
    
    // Add elements to container
    this.container.appendChild(header);
    this.container.appendChild(messagesArea);
    this.container.appendChild(inputArea);
    
    // Store references to elements
    this.elements = {
      header,
      messagesArea,
      inputArea,
      input: inputArea.querySelector('.cqb-input'),
      sendButton: inputArea.querySelector('.cqb-send-button'),
      minimizeButton: header.querySelector('.cqb-minimize-button')
    };
  }
  
  /**
   * Apply theme to the chat interface
   */
  applyTheme() {
    const { theme } = this.config;
    
    // Create CSS variables
    const cssVars = {
      '--cqb-primary-color': theme.primaryColor,
      '--cqb-secondary-color': theme.secondaryColor,
      '--cqb-font-family': theme.fontFamily,
      '--cqb-font-size': theme.fontSize,
      '--cqb-border-radius': theme.borderRadius,
      '--cqb-shadow': theme.boxShadow
    };
    
    // Apply CSS variables to container
    Object.entries(cssVars).forEach(([key, value]) => {
      this.container.style.setProperty(key, value);
    });
  }
  
  /**
   * Add event listeners to UI elements
   */
  addEventListeners() {
    // Send button click
    this.elements.sendButton.addEventListener('click', this.handleUserInput);
    
    // Input keypress (Enter)
    this.elements.input.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.handleUserInput();
      }
    });
    
    // Minimize button click
    this.elements.minimizeButton.addEventListener('click', () => {
      this.isMinimized ? this.open() : this.minimize();
    });
  }
  
  /**
   * Handle user input from text input
   */
  handleUserInput() {
    const input = this.elements.input;
    const value = input.value.trim();
    
    if (!value) return;
    
    // Add user message to chat
    this.addMessage(value, 'user');
    
    // Clear input
    input.value = '';
    
    // Emit user input event
    this.emit('userInput', { type: INPUT_TYPES.TEXT, value });
    
    // Show typing indicator
    this.showTypingIndicator();
  }
  
  /**
   * Handle option selection
   * @param {string} value - Selected option value
   * @param {string} label - Selected option label
   */
  handleOptionSelect(value, label) {
    // Add user message to chat
    this.addMessage(label, 'user');
    
    // Emit user input event
    this.emit('userInput', { type: INPUT_TYPES.OPTIONS, value, label });
    
    // Show typing indicator
    this.showTypingIndicator();
  }
  
  /**
   * Handle form submission
   * @param {Object} formData - Form data
   */
  handleFormSubmit(formData) {
    // Create summary of form data
    const summary = Object.entries(formData)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    // Add user message to chat
    this.addMessage(summary, 'user');
    
    // Emit user input event
    this.emit('userInput', { type: INPUT_TYPES.FORM, value: formData });
    
    // Show typing indicator
    this.showTypingIndicator();
  }
  
  /**
   * Handle date selection
   * @param {string} date - Selected date
   */
  handleDateSelect(date) {
    // Add user message to chat
    this.addMessage(date, 'user');
    
    // Emit user input event
    this.emit('userInput', { type: INPUT_TYPES.DATE, value: date });
    
    // Show typing indicator
    this.showTypingIndicator();
  }
  
  /**
   * Add a message to the chat
   * @param {string} text - Message text
   * @param {string} sender - Message sender ('bot' or 'user')
   */
  addMessage(text, sender = 'bot') {
    // Create message element
    const message = document.createElement('div');
    message.className = `cqb-message cqb-message-${sender} cqb-fade-in`;
    message.textContent = text;
    
    // Add message to messages area
    this.elements.messagesArea.appendChild(message);
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  /**
   * Add options to the chat
   * @param {Array} options - Array of options
   */
  addOptions(options) {
    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'cqb-options cqb-fade-in';
    
    // Create option buttons
    options.forEach(option => {
      const optionButton = document.createElement('button');
      optionButton.className = 'cqb-option';
      optionButton.textContent = option.label;
      
      // Add click event listener
      optionButton.addEventListener('click', () => {
        this.handleOptionSelect(option.value, option.label);
        
        // Disable all options
        optionsContainer.querySelectorAll('.cqb-option').forEach(btn => {
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.style.cursor = 'default';
        });
      });
      
      optionsContainer.appendChild(optionButton);
    });
    
    // Add options to messages area
    this.elements.messagesArea.appendChild(optionsContainer);
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  /**
   * Add a form to the chat
   * @param {Object} formConfig - Form configuration
   */
  addForm(formConfig) {
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.className = 'cqb-form cqb-fade-in';
    
    // Create form
    const form = document.createElement('form');
    form.className = 'cqb-form';
    
    // Create form fields
    formConfig.fields.forEach(field => {
      const formGroup = document.createElement('div');
      formGroup.className = 'cqb-form-group';
      
      // Create label
      const label = document.createElement('label');
      label.className = 'cqb-form-label';
      label.textContent = field.label;
      
      // Create input
      const input = document.createElement('input');
      input.className = 'cqb-form-input';
      input.type = field.type || 'text';
      input.name = field.name;
      input.placeholder = field.placeholder || '';
      input.required = field.required || false;
      
      // Add label and input to form group
      formGroup.appendChild(label);
      formGroup.appendChild(input);
      
      // Add form group to form
      form.appendChild(formGroup);
    });
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.className = 'cqb-send-button';
    submitButton.type = 'submit';
    submitButton.textContent = formConfig.submitText || 'Submit';
    
    // Add submit button to form
    form.appendChild(submitButton);
    
    // Add form to form container
    formContainer.appendChild(form);
    
    // Add form submit event listener
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      
      // Get form data
      const formData = {};
      const formElements = form.elements;
      
      for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i];
        
        if (element.name && element.type !== 'submit') {
          formData[element.name] = element.value;
        }
      }
      
      // Handle form submission
      this.handleFormSubmit(formData);
      
      // Remove form
      formContainer.remove();
    });
    
    // Add form to messages area
    this.elements.messagesArea.appendChild(formContainer);
    
    // Focus on first input
    const firstInput = form.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    }
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  /**
   * Add a date picker to the chat
   * @param {Array} dates - Array of available dates
   */
  addDatePicker(dates) {
    // Create date picker container
    const datePickerContainer = document.createElement('div');
    datePickerContainer.className = 'cqb-date-picker cqb-fade-in';
    
    // Create date options
    dates.forEach(date => {
      const dateOption = document.createElement('div');
      dateOption.className = 'cqb-date-option';
      dateOption.textContent = date.label;
      
      // Add click event listener
      dateOption.addEventListener('click', () => {
        this.handleDateSelect(date.value);
        
        // Highlight selected date
        datePickerContainer.querySelectorAll('.cqb-date-option').forEach(option => {
          option.classList.remove('selected');
        });
        
        dateOption.classList.add('selected');
      });
      
      datePickerContainer.appendChild(dateOption);
    });
    
    // Add date picker to messages area
    this.elements.messagesArea.appendChild(datePickerContainer);
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  /**
   * Add pricing information to the chat
   * @param {Object} pricing - Pricing information
   */
  addPricing(pricing) {
    // Create pricing container
    const pricingContainer = document.createElement('div');
    pricingContainer.className = 'cqb-pricing cqb-fade-in';
    
    // Create pricing header
    const pricingHeader = document.createElement('div');
    pricingHeader.className = 'cqb-pricing-header';
    pricingHeader.textContent = pricing.title || 'Pricing Options';
    
    // Add pricing header to pricing container
    pricingContainer.appendChild(pricingHeader);
    
    // Create pricing options
    pricing.options.forEach(option => {
      const pricingOption = document.createElement('div');
      pricingOption.className = 'cqb-pricing-option';
      
      // Create pricing name
      const pricingName = document.createElement('div');
      pricingName.className = 'cqb-pricing-name';
      pricingName.textContent = option.name;
      
      // Create pricing price
      const pricingPrice = document.createElement('div');
      pricingPrice.className = 'cqb-pricing-price';
      pricingPrice.textContent = option.price;
      
      // Add pricing name and price to pricing option
      pricingOption.appendChild(pricingName);
      pricingOption.appendChild(pricingPrice);
      
      // Add pricing details if available
      if (option.details) {
        const pricingDetails = document.createElement('div');
        pricingDetails.className = 'cqb-pricing-details';
        pricingDetails.textContent = option.details;
        
        pricingOption.appendChild(pricingDetails);
      }
      
      // Add pricing option to pricing container
      pricingContainer.appendChild(pricingOption);
    });
    
    // Add pricing container to messages area
    this.elements.messagesArea.appendChild(pricingContainer);
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  /**
   * Add a summary to the chat
   * @param {Object} summary - Summary information
   */
  addSummary(summary) {
    // Create summary container
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'cqb-summary cqb-fade-in';
    
    // Create summary header
    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'cqb-summary-header';
    summaryHeader.textContent = summary.title || 'Summary';
    
    // Add summary header to summary container
    summaryContainer.appendChild(summaryHeader);
    
    // Create summary items
    summary.items.forEach(item => {
      const summaryItem = document.createElement('div');
      summaryItem.className = 'cqb-summary-item';
      
      // Create summary label
      const summaryLabel = document.createElement('div');
      summaryLabel.className = 'cqb-summary-label';
      summaryLabel.textContent = item.label;
      
      // Create summary value
      const summaryValue = document.createElement('div');
      summaryValue.className = 'cqb-summary-value';
      summaryValue.textContent = item.value;
      
      // Add summary label and value to summary item
      summaryItem.appendChild(summaryLabel);
      summaryItem.appendChild(summaryValue);
      
      // Add summary item to summary container
      summaryContainer.appendChild(summaryItem);
    });
    
    // Add summary container to messages area
    this.elements.messagesArea.appendChild(summaryContainer);
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    // If already showing typing indicator, return
    if (this.isTyping) return;
    
    // Set typing flag
    this.isTyping = true;
    
    // Create typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'cqb-typing cqb-fade-in';
    typingIndicator.innerHTML = `
      <div class="cqb-typing-dot"></div>
      <div class="cqb-typing-dot"></div>
      <div class="cqb-typing-dot"></div>
    `;
    
    // Add typing indicator to messages area
    this.elements.messagesArea.appendChild(typingIndicator);
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    // If not showing typing indicator, return
    if (!this.isTyping) return;
    
    // Set typing flag
    this.isTyping = false;
    
    // Remove typing indicator
    const typingIndicator = this.elements.messagesArea.querySelector('.cqb-typing');
    
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    // Hide typing indicator
    this.hideTypingIndicator();
    
    // Add error message
    this.addMessage(`Error: ${message}`, 'bot');
  }
  
  /**
   * Update UI from state
   * @param {Object} stateData - State data
   */
  updateFromState(stateData) {
    // Hide typing indicator
    this.hideTypingIndicator();
    
    // Add bot message if available
    if (stateData.message) {
      this.addMessage(stateData.message, 'bot');
    }
    
    // Add options if available
    if (stateData.options) {
      this.addOptions(stateData.options);
    }
    
    // Add form if available
    if (stateData.form) {
      this.addForm(stateData.form);
    }
    
    // Add date picker if available
    if (stateData.dates) {
      this.addDatePicker(stateData.dates);
    }
    
    // Add pricing if available
    if (stateData.pricing) {
      this.addPricing(stateData.pricing);
    }
    
    // Add summary if available
    if (stateData.summary) {
      this.addSummary(stateData.summary);
    }
    
    // Update input area based on input type
    if (stateData.inputType) {
      this.updateInputArea(stateData.inputType);
    }
  }
  
  /**
   * Update input area based on input type
   * @param {string} inputType - Input type
   */
  updateInputArea(inputType) {
    // Show/hide input area based on input type
    if (inputType === INPUT_TYPES.TEXT) {
      this.elements.inputArea.style.display = 'flex';
      this.elements.input.focus();
    } else {
      this.elements.inputArea.style.display = 'none';
    }
  }
  
  /**
   * Scroll messages area to bottom
   */
  scrollToBottom() {
    const { messagesArea } = this.elements;
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }
  
  /**
   * Open the chat bot
   */
  open() {
    if (!this.isMinimized) return;
    
    // Update minimized flag
    this.isMinimized = false;
    
    // Show messages area and input area
    this.elements.messagesArea.style.display = 'flex';
    this.elements.inputArea.style.display = 'flex';
    
    // Update minimize button text
    this.elements.minimizeButton.textContent = '−';
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  /**
   * Minimize the chat bot
   */
  minimize() {
    if (this.isMinimized) return;
    
    // Update minimized flag
    this.isMinimized = true;
    
    // Hide messages area and input area
    this.elements.messagesArea.style.display = 'none';
    this.elements.inputArea.style.display = 'none';
    
    // Update minimize button text
    this.elements.minimizeButton.textContent = '+';
  }
  
  /**
   * Reset the UI
   */
  reset() {
    // Clear messages area
    this.elements.messagesArea.innerHTML = '';
    
    // Clear input
    this.elements.input.value = '';
    
    // Reset typing flag
    this.isTyping = false;
    
    // Show input area
    this.elements.inputArea.style.display = 'flex';
    
    // Open chat bot if minimized
    if (this.isMinimized) {
      this.open();
    }
  }
  
  /**
   * Update configuration
   * @param {Object} config - New configuration
   */
  updateConfig(config) {
    // Update config
    Object.assign(this.config, config);
    
    // Apply theme if theme was updated
    if (config.theme) {
      this.applyTheme();
    }
  }
}
