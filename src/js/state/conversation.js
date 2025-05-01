/**
 * Cleaning Service Quote Bot - Conversation Flow
 * This file defines the conversation flow for the chat bot
 */

import { STATES, API_ACTIONS, INPUT_TYPES, VALIDATION_TYPES } from '../utils/config.js';
import { validatePostalCode, validateEmail, validatePhone } from '../utils/helpers.js';

/**
 * Conversation flow definition
 * Each state has:
 * - enter: Function called when entering the state
 * - handleInput: Function called when user provides input in this state
 * - handleAPIResponse: Function called when API responds in this state
 */
export const conversationFlow = {
  // Welcome state
  [STATES.WELCOME]: {
    enter: (data, config) => {
      return {
        message: config.welcomeMessage,
        inputType: INPUT_TYPES.TEXT,
        validation: { type: VALIDATION_TYPES.POSTAL_CODE }
      };
    },
    handleInput: (input, data) => {
      const postalCode = input.value.trim();
      
      // Validate postal code format
      if (!validatePostalCode(postalCode)) {
        return {
          message: "That doesn't look like a valid postal code. Please enter a valid postal code (e.g., 12345).",
          inputType: INPUT_TYPES.TEXT,
          validation: { type: VALIDATION_TYPES.POSTAL_CODE }
        };
      }
      
      console.log(`[Conversation] Transitioning to VALIDATING_POSTAL_CODE with postal code: ${postalCode}`);
      return {
        data: { postalCode },
        nextState: STATES.VALIDATING_POSTAL_CODE,
        apiAction: API_ACTIONS.VALIDATE_POSTAL_CODE,
        apiParams: { postalCode }
      };
    }
  },
  
  // Validating postal code state
  [STATES.VALIDATING_POSTAL_CODE]: {
    enter: (data) => {
      console.log(`[Conversation] Entering VALIDATING_POSTAL_CODE state with data:`, data);
      return {
        message: "I'm checking if we provide service in your area...",
        inputType: null,
        apiAction: API_ACTIONS.VALIDATE_POSTAL_CODE,
        apiParams: { postalCode: data.postalCode }
      };
    },
    handleInput: (input, data) => {
      // User input is not expected in this state, but handle it gracefully
      return {
        message: "Please wait while I check if we provide service in your area...",
        inputType: null
      };
    },
    handleAPIResponse: (response, data) => {
      console.log(`[Conversation] VALIDATING_POSTAL_CODE handleAPIResponse called with:`, response);
      
      // Check if response is valid
      if (!response || !response.Result) {
        console.error(`[Conversation] Invalid API response in VALIDATING_POSTAL_CODE:`, response);
        return {
          nextState: STATES.ERROR,
          message: "I'm sorry, I couldn't validate your postal code. Please try again.",
          data: { error: "Invalid API response" }
        };
      }
      
      const postalCodeData = response.Result;
      console.log(`[Conversation] Postal code data:`, postalCodeData);
      
      // Check if service is available
      if (postalCodeData.IsValid && postalCodeData.IsServiceAvailable) {
        let message = `Great! We provide service in ${postalCodeData.City}, ${postalCodeData.Region}.`;
        
        // Add notes if available
        if (postalCodeData.Notes) {
          message += ` ${postalCodeData.Notes}`;
        }
        
        console.log(`[Conversation] Service is available, transitioning to SERVICE_SELECTION`);
        return {
          data: { postalCodeData },
          nextState: STATES.SERVICE_SELECTION,
          message,
          apiAction: API_ACTIONS.GET_SCOPE_GROUPS
        };
      } else {
        console.log(`[Conversation] Service is NOT available, transitioning to SERVICE_UNAVAILABLE`);
        return {
          data: { postalCodeData },
          nextState: STATES.SERVICE_UNAVAILABLE,
          message: "I'm sorry, but we don't currently offer service in your area.",
          options: [
            { value: 'contact', label: 'Contact me when available' },
            { value: 'end', label: 'No thanks' }
          ]
        };
      }
    }
  },
  
  // Service unavailable state
  [STATES.SERVICE_UNAVAILABLE]: {
    enter: (data) => {
      return {
        message: "I'm sorry, but we don't currently offer service in your area.",
        options: [
          { value: 'contact', label: 'Contact me when available' },
          { value: 'end', label: 'No thanks' }
        ],
        inputType: INPUT_TYPES.OPTIONS
      };
    },
    handleInput: (input, data) => {
      if (input.value === 'contact') {
        return {
          nextState: STATES.CONTACT_COLLECTION,
          message: "Please provide your contact information and we'll reach out when service becomes available in your area."
        };
      } else {
        return {
          nextState: STATES.THANK_YOU,
          message: "Thank you for your interest. If you'd like to check back later, you can visit our website or call us at (555) 123-4567."
        };
      }
    }
  },
  
  // Service selection state
  [STATES.SERVICE_SELECTION]: {
    enter: (data) => {
      // If we don't have scope groups yet, show loading message
      if (!data.scopeGroups) {
        return {
          message: "Let me find the available services for you...",
          inputType: null
        };
      }
      
      // Create options from scope groups
      const options = data.scopeGroups.map(group => ({
        value: group.ScopeGroupId.toString(),
        label: group.Name
      }));
      
      return {
        message: "What type of cleaning service are you interested in?",
        options,
        inputType: INPUT_TYPES.OPTIONS
      };
    },
    handleInput: (input, data) => {
      const selectedGroupId = parseInt(input.value);
      const selectedGroup = data.scopeGroups.find(group => group.ScopeGroupId === selectedGroupId);
      
      if (!selectedGroup) {
        return {
          message: "I'm sorry, I couldn't find that service. Please select from the options below.",
          options: data.scopeGroups.map(group => ({
            value: group.ScopeGroupId.toString(),
            label: group.Name
          })),
          inputType: INPUT_TYPES.OPTIONS
        };
      }
      
      return {
        data: { 
          selectedService: {
            id: selectedGroup.ScopeGroupId,
            name: selectedGroup.Name,
            scopes: selectedGroup.Scopes
          }
        },
        nextState: STATES.HOME_QUESTIONS,
        apiAction: API_ACTIONS.GET_QUESTIONS,
        apiParams: { 
          scopeIds: selectedGroup.Scopes.map(scope => scope.ScopeId) 
        }
      };
    },
    handleAPIResponse: (response, data) => {
      // Store scope groups
      return {
        data: { scopeGroups: response.Result }
      };
    }
  },
  
  // Home questions state
  [STATES.HOME_QUESTIONS]: {
    enter: (data) => {
      // If we don't have questions yet, show loading message
      if (!data.questions) {
        return {
          message: "I need to ask a few questions about your home to provide an accurate quote...",
          inputType: null
        };
      }
      
      // If we've answered all questions, move to pricing calculation
      if (data.currentQuestionIndex >= data.questions.length) {
        return {
          nextState: STATES.PRICING_CALCULATION,
          apiAction: API_ACTIONS.GET_PRICING,
          apiParams: {
            ScopeGroupId: data.selectedService.id,
            PostalCode: data.postalCode,
            ScopesOfWork: data.selectedService.scopes.map(scope => ({
              ScopeOfWorkId: scope.ScopeId,
              Frequency: scope.Frequencies[0].FrequencyId
            })),
            Questions: Object.entries(data.homeDetails).map(([id, answer]) => ({
              QuestionId: parseInt(id),
              Answer: answer.toString()
            }))
          }
        };
      }
      
      // Get current question
      const question = data.questions[data.currentQuestionIndex];
      
      // Create options from question answers
      const options = question.Answers.map(answer => ({
        value: answer.AnswerId.toString(),
        label: answer.AnswerText
      }));
      
      return {
        message: question.QuestionText,
        options,
        inputType: INPUT_TYPES.OPTIONS
      };
    },
    handleInput: (input, data) => {
      // Get current question
      const currentQuestionIndex = data.currentQuestionIndex || 0;
      const question = data.questions[currentQuestionIndex];
      
      // Store answer
      const homeDetails = { ...data.homeDetails };
      homeDetails[question.QuestionId] = input.value;
      
      // Move to next question
      return {
        data: { 
          homeDetails,
          currentQuestionIndex: currentQuestionIndex + 1
        },
        nextState: STATES.HOME_QUESTIONS
      };
    },
    handleAPIResponse: (response, data) => {
      // Store questions
      return {
        data: { 
          questions: response.Result,
          currentQuestionIndex: 0,
          homeDetails: {}
        }
      };
    }
  },
  
  // Pricing calculation state
  [STATES.PRICING_CALCULATION]: {
    enter: () => {
      return {
        message: "I'm calculating your quote based on the information you provided...",
        inputType: null
      };
    },
    handleInput: (input, data) => {
      // User input is not expected in this state, but handle it gracefully
      return {
        message: "Please wait while I calculate your quote...",
        inputType: null
      };
    },
    handleAPIResponse: (response, data) => {
      // Store pricing data
      return {
        data: { pricing: response.Result },
        nextState: STATES.PRICING_DISPLAY
      };
    }
  },
  
  // Pricing display state
  [STATES.PRICING_DISPLAY]: {
    enter: (data) => {
      if (!data.pricing) {
        return {
          message: "I'm sorry, I couldn't calculate pricing at this time. Please try again later.",
          nextState: STATES.ERROR
        };
      }
      
      // Create pricing options
      const pricingOptions = [];
      
      data.pricing.forEach(scope => {
        scope.Frequencies.forEach(freq => {
          pricingOptions.push({
            scopeId: scope.ScopeId,
            scopeName: scope.ScopeName,
            frequencyId: freq.FrequencyId,
            frequencyName: freq.FrequencyName,
            price: freq.TotalRecurringCost,
            hours: freq.TotalRecurringHours
          });
        });
      });
      
      // Sort by price
      pricingOptions.sort((a, b) => a.price - b.price);
      
      // Format pricing for display
      const pricing = {
        title: "Here's your personalized quote:",
        options: pricingOptions.map(option => ({
          name: `${option.scopeName} (${option.frequencyName})`,
          price: `$${option.price.toFixed(2)}`,
          details: `Estimated time: ${option.hours.toFixed(1)} hours`
        }))
      };
      
      return {
        message: "Based on the information you provided, here are your pricing options:",
        pricing,
        options: [
          { value: 'continue', label: 'Continue with this quote' },
          { value: 'restart', label: 'Start over' }
        ],
        inputType: INPUT_TYPES.OPTIONS,
        data: { pricingOptions }
      };
    },
    handleInput: (input, data) => {
      if (input.value === 'continue') {
        return {
          nextState: STATES.CONTACT_COLLECTION,
          message: "Great! To proceed with your quote, I'll need your contact information."
        };
      } else {
        return {
          nextState: STATES.WELCOME
        };
      }
    }
  },
  
  // Contact collection state
  [STATES.CONTACT_COLLECTION]: {
    enter: () => {
      return {
        message: "Please provide your contact information:",
        form: {
          fields: [
            {
              name: 'firstName',
              label: 'First Name',
              type: 'text',
              required: true
            },
            {
              name: 'lastName',
              label: 'Last Name',
              type: 'text',
              required: true
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              required: true
            },
            {
              name: 'phone',
              label: 'Phone',
              type: 'tel',
              required: true
            }
          ],
          submitText: 'Submit'
        },
        inputType: INPUT_TYPES.FORM
      };
    },
    handleInput: (input, data) => {
      const formData = input.value;
      
      // Validate email
      if (!validateEmail(formData.email)) {
        return {
          message: "Please enter a valid email address.",
          form: {
            fields: [
              {
                name: 'firstName',
                label: 'First Name',
                type: 'text',
                required: true,
                value: formData.firstName
              },
              {
                name: 'lastName',
                label: 'Last Name',
                type: 'text',
                required: true,
                value: formData.lastName
              },
              {
                name: 'email',
                label: 'Email',
                type: 'email',
                required: true
              },
              {
                name: 'phone',
                label: 'Phone',
                type: 'tel',
                required: true,
                value: formData.phone
              }
            ],
            submitText: 'Submit'
          },
          inputType: INPUT_TYPES.FORM
        };
      }
      
      // Validate phone
      if (!validatePhone(formData.phone)) {
        return {
          message: "Please enter a valid phone number.",
          form: {
            fields: [
              {
                name: 'firstName',
                label: 'First Name',
                type: 'text',
                required: true,
                value: formData.firstName
              },
              {
                name: 'lastName',
                label: 'Last Name',
                type: 'text',
                required: true,
                value: formData.lastName
              },
              {
                name: 'email',
                label: 'Email',
                type: 'email',
                required: true,
                value: formData.email
              },
              {
                name: 'phone',
                label: 'Phone',
                type: 'tel',
                required: true
              }
            ],
            submitText: 'Submit'
          },
          inputType: INPUT_TYPES.FORM
        };
      }
      
      // If service is unavailable, thank the user and end
      if (data.postalCodeData && !data.postalCodeData.IsServiceAvailable) {
        return {
          data: { contactInfo: formData },
          nextState: STATES.THANK_YOU,
          message: `Thank you, ${formData.firstName}! We've recorded your information and will contact you when service becomes available in your area.`
        };
      }
      
      // Otherwise, create a lead
      return {
        data: { contactInfo: formData },
        nextState: STATES.LEAD_CREATION,
        apiAction: API_ACTIONS.CREATE_LEAD,
        apiParams: {
          FirstName: formData.firstName,
          LastName: formData.lastName,
          Email: formData.email,
          Phone: formData.phone,
          PostalCode: data.postalCode,
          SendLeadEmail: true,
          AddToCampaigns: true,
          TriggerWebhook: true,
          Notes: `Interested in ${data.selectedService.name}`
        }
      };
    }
  },
  
  // Lead creation state
  [STATES.LEAD_CREATION]: {
    enter: () => {
      return {
        message: "Creating your account...",
        inputType: null
      };
    },
    handleInput: (input, data) => {
      // User input is not expected in this state, but handle it gracefully
      return {
        message: "Please wait while I create your account...",
        inputType: null
      };
    },
    handleAPIResponse: (response, data) => {
      // Store lead ID
      return {
        data: { leadId: response.Result.LeadId },
        nextState: STATES.QUOTE_CREATION,
        apiAction: API_ACTIONS.CREATE_QUOTE,
        apiParams: {
          LeadId: response.Result.LeadId,
          HomeAddress1: '',
          HomeCity: data.postalCodeData.City,
          HomeRegion: data.postalCodeData.Region,
          HomePostalCode: data.postalCode,
          SendQuoteEmail: true,
          AddToCampaigns: true,
          TriggerWebhook: true,
          ScopeGroupId: data.selectedService.id,
          ScopesOfWork: data.pricingOptions.map(option => ({
            ScopeOfWorkId: option.scopeId,
            Frequency: option.frequencyId
          })),
          Questions: Object.entries(data.homeDetails).map(([id, answer]) => ({
            QuestionId: parseInt(id),
            Answer: answer.toString()
          }))
        }
      };
    }
  },
  
  // Quote creation state
  [STATES.QUOTE_CREATION]: {
    enter: () => {
      return {
        message: "Creating your quote...",
        inputType: null
      };
    },
    handleInput: (input, data) => {
      // User input is not expected in this state, but handle it gracefully
      return {
        message: "Please wait while I create your quote...",
        inputType: null
      };
    },
    handleAPIResponse: (response, data) => {
      // Store quote ID
      return {
        data: { quoteId: response.Result.QuoteId },
        nextState: STATES.QUOTE_SUMMARY
      };
    }
  },
  
  // Quote summary state
  [STATES.QUOTE_SUMMARY]: {
    enter: (data) => {
      // Create summary
      const summary = {
        title: "Your Quote Summary",
        items: [
          {
            label: "Name",
            value: `${data.contactInfo.firstName} ${data.contactInfo.lastName}`
          },
          {
            label: "Email",
            value: data.contactInfo.email
          },
          {
            label: "Phone",
            value: data.contactInfo.phone
          },
          {
            label: "Service",
            value: data.selectedService.name
          },
          {
            label: "Quote ID",
            value: data.quoteId
          }
        ]
      };
      
      return {
        message: `Thank you, ${data.contactInfo.firstName}! Your quote has been created.`,
        summary,
        options: [
          { value: 'book', label: 'Book Now' },
          { value: 'later', label: 'Book Later' }
        ],
        inputType: INPUT_TYPES.OPTIONS
      };
    },
    handleInput: (input, data) => {
      if (input.value === 'book') {
        return {
          nextState: STATES.BOOKING_OPTION,
          apiAction: API_ACTIONS.GET_AVAILABILITY,
          apiParams: {
            scopeGroupId: data.selectedService.id,
            hours: data.pricingOptions[0].hours
          }
        };
      } else {
        return {
          nextState: STATES.THANK_YOU,
          message: `Thank you for your interest! You can book your service later by visiting the link we sent to your email or by calling us at (555) 123-4567.`
        };
      }
    }
  },
  
  // Booking option state
  [STATES.BOOKING_OPTION]: {
    enter: (data) => {
      // If we don't have availability data yet, show loading message
      if (!data.availableDates) {
        return {
          message: "Checking available appointment times...",
          inputType: null
        };
      }
      
      // Format dates for display
      const dateOptions = data.availableDates.map(date => {
        const dateObj = new Date(date);
        return {
          value: date,
          label: dateObj.toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          })
        };
      });
      
      return {
        message: "Please select a preferred date and time for your service:",
        dates: dateOptions,
        inputType: INPUT_TYPES.DATE
      };
    },
    handleInput: (input, data) => {
      return {
        data: { bookingDate: input.value },
        nextState: STATES.BOOKING_CONFIRMATION,
        apiAction: API_ACTIONS.BOOK_QUOTE,
        apiParams: {
          LeadId: data.leadId,
          QuoteId: data.quoteId,
          SendBookedEmail: true,
          SendCustomerPortalInvite: true,
          AddToCampaigns: true,
          TriggerWebhook: true,
          ScopeGroupId: data.selectedService.id,
          ScopesOfWork: [
            {
              FirstJobDate: input.value,
              ScopeOfWorkId: data.pricingOptions[0].scopeId,
              Frequency: data.pricingOptions[0].frequencyId
            }
          ]
        }
      };
    },
    handleAPIResponse: (response, data) => {
      // Store available dates
      return {
        data: { availableDates: response.Result }
      };
    }
  },
  
  // Booking confirmation state
  [STATES.BOOKING_CONFIRMATION]: {
    enter: () => {
      return {
        message: "Processing your booking...",
        inputType: null
      };
    },
    handleInput: (input, data) => {
      // User input is not expected in this state, but handle it gracefully
      return {
        message: "Please wait while I process your booking...",
        inputType: null
      };
    },
    handleAPIResponse: (response, data) => {
      return {
        nextState: STATES.THANK_YOU,
        message: `Great news! Your booking has been confirmed. We'll see you on ${new Date(data.bookingDate).toLocaleString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        })}.`
      };
    }
  },
  
  // Thank you state
  [STATES.THANK_YOU]: {
    enter: (data, config) => {
      // If we have a custom message, use it
      if (data.message) {
        return {
          message: data.message,
          inputType: null
        };
      }
      
      return {
        message: "Thank you for using our service! Is there anything else I can help you with?",
        options: [
          { value: 'restart', label: 'Start Over' },
          { value: 'end', label: 'No, I\'m Done' }
        ],
        inputType: INPUT_TYPES.OPTIONS
      };
    },
    handleInput: (input, data) => {
      if (input.value === 'restart') {
        return {
          nextState: STATES.WELCOME
        };
      } else {
        return {
          message: "Thank you for using our service. Have a great day!"
        };
      }
    }
  },
  
  // Error state
  [STATES.ERROR]: {
    enter: (data) => {
      return {
        message: data.error || "I'm sorry, something went wrong. Please try again.",
        options: [
          { value: 'restart', label: 'Start Over' },
          { value: 'end', label: 'End Conversation' }
        ],
        inputType: INPUT_TYPES.OPTIONS
      };
    },
    handleInput: (input, data) => {
      if (input.value === 'restart') {
        return {
          nextState: STATES.WELCOME
        };
      } else {
        return {
          message: "Thank you for your patience. Have a great day!"
        };
      }
    }
  }
};
