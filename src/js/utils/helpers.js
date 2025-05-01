/**
 * Cleaning Service Quote Bot - Helper Functions
 * This file contains utility functions used throughout the application
 */

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export function mergeObjects(target, source) {
  const output = { ...target };
  
  if (!isObject(target) || !isObject(source)) {
    return source;
  }
  
  Object.keys(source).forEach(key => {
    if (isObject(source[key])) {
      if (!(key in target)) {
        output[key] = source[key];
      } else {
        output[key] = mergeObjects(target[key], source[key]);
      }
    } else {
      output[key] = source[key];
    }
  });
  
  return output;
}

/**
 * Check if value is an object
 * @param {*} item - Value to check
 * @returns {boolean} True if object
 */
export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid
 */
export function validatePhone(phone) {
  const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return re.test(String(phone));
}

/**
 * Validate postal code
 * @param {string} postalCode - Postal code to validate
 * @returns {boolean} True if valid
 */
export function validatePostalCode(postalCode) {
  // This is a simple validation for US zip codes
  // In a real application, you would want to validate based on country
  const re = /^\d{5}(-\d{4})?$/;
  return re.test(String(postalCode));
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create a simple event emitter
 * @returns {Object} Event emitter object
 */
export function createEventEmitter() {
  const events = {};
  
  return {
    on(event, listener) {
      if (!events[event]) {
        events[event] = [];
      }
      events[event].push(listener);
    },
    
    off(event, listener) {
      if (!events[event]) return;
      events[event] = events[event].filter(l => l !== listener);
    },
    
    emit(event, ...args) {
      if (!events[event]) return;
      events[event].forEach(listener => {
        listener(...args);
      });
    }
  };
}

/**
 * Store data in local storage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {string} prefix - Key prefix
 */
export function setStorageItem(key, value, prefix = 'cqb_') {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(`${prefix}${key}`, serializedValue);
  } catch (error) {
    console.error('Error storing data in localStorage:', error);
  }
}

/**
 * Get data from local storage
 * @param {string} key - Storage key
 * @param {string} prefix - Key prefix
 * @returns {*} Stored value or null
 */
export function getStorageItem(key, prefix = 'cqb_') {
  try {
    const serializedValue = localStorage.getItem(`${prefix}${key}`);
    return serializedValue ? JSON.parse(serializedValue) : null;
  } catch (error) {
    console.error('Error retrieving data from localStorage:', error);
    return null;
  }
}

/**
 * Remove data from local storage
 * @param {string} key - Storage key
 * @param {string} prefix - Key prefix
 */
export function removeStorageItem(key, prefix = 'cqb_') {
  try {
    localStorage.removeItem(`${prefix}${key}`);
  } catch (error) {
    console.error('Error removing data from localStorage:', error);
  }
}
