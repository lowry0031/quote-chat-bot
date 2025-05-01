/**
 * Cleaning Service Quote Bot - Mock API
 * This file provides mock API responses for testing
 */

import { API_ACTIONS } from '../utils/config.js';

/**
 * Mock API function
 * @param {string} action - API action
 * @param {Object} params - API parameters
 * @param {string} scenario - Test scenario
 * @returns {Promise<Object>} Mock response
 */
export async function mockAPI(action, params, scenario = 'default') {
  // Add a delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`[Mock API] Called action: ${action} with params:`, params, `scenario: ${scenario}`);
  
  // Add a delay to simulate network latency
  console.log(`[Mock API] Waiting 500ms to simulate network latency...`);
  
  // Handle different scenarios
  if (scenario === 'error') {
    return mockErrorResponse(action);
  }
  
  // Handle specific actions
  switch (action) {
    case API_ACTIONS.VALIDATE_POSTAL_CODE:
      return mockValidatePostalCode(params.postalCode, scenario);
    case API_ACTIONS.GET_SCOPE_GROUPS:
      return mockGetScopeGroups();
    case API_ACTIONS.GET_SCOPES:
      return mockGetScopes(params.scopeGroupId);
    case API_ACTIONS.GET_QUESTIONS:
      return mockGetQuestions(params.scopeIds);
    case API_ACTIONS.GET_RATE_MODIFICATIONS:
      return mockGetRateModifications(params.scopeId);
    case API_ACTIONS.GET_PRICING:
      return mockGetPricing(params);
    case API_ACTIONS.CREATE_LEAD:
      return mockCreateLead(params);
    case API_ACTIONS.CREATE_QUOTE:
      return mockCreateQuote(params);
    case API_ACTIONS.GET_AVAILABILITY:
      return mockGetAvailability(params);
    case API_ACTIONS.BOOK_QUOTE:
      return mockBookQuote(params);
    default:
      throw new Error(`Unknown mock API action: ${action}`);
  }
}

/**
 * Mock error response
 * @param {string} action - API action
 * @returns {Object} Error response
 */
function mockErrorResponse(action) {
  return {
    IsSuccess: false,
    Message: `Mock error for ${action}`,
    Result: null,
    InnerException: "This is a simulated error for testing purposes",
    StatusCode: 500
  };
}

/**
 * Mock validate postal code
 * @param {string} postalCode - Postal code
 * @param {string} scenario - Test scenario
 * @returns {Object} Mock response
 */
function mockValidatePostalCode(postalCode, scenario) {
  console.log(`[Mock API] mockValidatePostalCode called with postalCode: ${postalCode}, scenario: ${scenario}`);
  
  // For the postalCodeInvalid scenario, return service not available
  if (scenario === 'postalCodeInvalid') {
    console.log(`[Mock API] Returning postalCodeInvalid response`);
    return {
      IsSuccess: true,
      Message: null,
      Result: {
        IsValid: true,
        IsServiceAvailable: false,
        Region: "NY",
        City: "Othertown",
        ServiceRegionId: null,
        ServiceRegionName: null,
        PricingAdjustment: null,
        MinimumHours: null,
        Notes: "Service coming soon to this area"
      },
      InnerException: null,
      StatusCode: 200
    };
  }
  
  // Default response
  console.log(`[Mock API] Returning default response for postal code: ${postalCode}`);
  return {
    IsSuccess: true,
    Message: null,
    Result: {
      IsValid: true,
      IsServiceAvailable: true,
      Region: "CA",
      City: "Anytown",
      ServiceRegionId: 5,
      ServiceRegionName: "West Coast",
      PricingAdjustment: 0,
      MinimumHours: 3.0,
      Notes: "This area requires a minimum of 3 hours per service"
    },
    InnerException: null,
    StatusCode: 200
  };
}

/**
 * Mock get scope groups
 * @returns {Object} Mock response
 */
function mockGetScopeGroups() {
  return {
    IsSuccess: true,
    Message: null,
    Result: [
      {
        ScopeGroupId: 1,
        Name: "Residential Cleaning",
        Scopes: [
          {
            ScopeId: 101,
            Name: "Regular Cleaning",
            IsRequired: true,
            Frequencies: [
              {
                FrequencyId: "weekly",
                Name: "Weekly"
              },
              {
                FrequencyId: "biweekly",
                Name: "Bi-Weekly"
              },
              {
                FrequencyId: "monthly",
                Name: "Monthly"
              }
            ]
          },
          {
            ScopeId: 102,
            Name: "Deep Cleaning",
            IsRequired: false,
            Frequencies: [
              {
                FrequencyId: "onetime",
                Name: "One-Time"
              }
            ]
          }
        ]
      },
      {
        ScopeGroupId: 2,
        Name: "Commercial Cleaning",
        Scopes: [
          {
            ScopeId: 201,
            Name: "Office Cleaning",
            IsRequired: true,
            Frequencies: [
              {
                FrequencyId: "weekly",
                Name: "Weekly"
              },
              {
                FrequencyId: "biweekly",
                Name: "Bi-Weekly"
              }
            ]
          }
        ]
      }
    ],
    InnerException: null,
    StatusCode: 200
  };
}

/**
 * Mock get scopes
 * @param {number} scopeGroupId - Scope group ID
 * @returns {Object} Mock response
 */
function mockGetScopes(scopeGroupId) {
  const scopeGroups = mockGetScopeGroups().Result;
  const scopeGroup = scopeGroups.find(group => group.ScopeGroupId === scopeGroupId);
  
  if (!scopeGroup) {
    return {
      IsSuccess: false,
      Message: `Scope group with ID ${scopeGroupId} not found`,
      Result: null,
      InnerException: null,
      StatusCode: 404
    };
  }
  
  return {
    IsSuccess: true,
    Message: null,
    Result: scopeGroup.Scopes,
    InnerException: null,
    StatusCode: 200
  };
}

/**
 * Mock get questions
 * @param {Array} scopeIds - Scope IDs
 * @returns {Object} Mock response
 */
function mockGetQuestions(scopeIds) {
  return {
    IsSuccess: true,
    Message: null,
    Result: [
      {
        ScopeId: 101,
        QuestionId: 1001,
        IsRequired: true,
        QuestionText: "How many bedrooms are in your home?",
        Answers: [
          {
            AnswerId: 10001,
            AnswerText: "1-2",
            Icon: "bedroom-small",
            Color: "#3498db",
            HelpText: "Small home",
            SortOrder: 1
          },
          {
            AnswerId: 10002,
            AnswerText: "3-4",
            Icon: "bedroom-medium",
            Color: "#2ecc71",
            HelpText: "Medium home",
            SortOrder: 2
          },
          {
            AnswerId: 10003,
            AnswerText: "5+",
            Icon: "bedroom-large",
            Color: "#e74c3c",
            HelpText: "Large home",
            SortOrder: 3
          }
        ],
        HelpText: "Please select the number of bedrooms",
        Icon: "home",
        Color: "#9b59b6",
        QuestionStepType: "Initial",
        QuestionType: "SelectList",
        TextValue: null,
        PricingAdjustmentDescription: "Affects base pricing",
        SortOrder: 1
      },
      {
        ScopeId: 101,
        QuestionId: 1002,
        IsRequired: true,
        QuestionText: "How many bathrooms are in your home?",
        Answers: [
          {
            AnswerId: 10011,
            AnswerText: "1-2",
            Icon: "bathroom-small",
            Color: "#3498db",
            HelpText: "Small home",
            SortOrder: 1
          },
          {
            AnswerId: 10012,
            AnswerText: "3-4",
            Icon: "bathroom-medium",
            Color: "#2ecc71",
            HelpText: "Medium home",
            SortOrder: 2
          },
          {
            AnswerId: 10013,
            AnswerText: "5+",
            Icon: "bathroom-large",
            Color: "#e74c3c",
            HelpText: "Large home",
            SortOrder: 3
          }
        ],
        HelpText: "Please select the number of bathrooms",
        Icon: "bathroom",
        Color: "#3498db",
        QuestionStepType: "Initial",
        QuestionType: "SelectList",
        TextValue: null,
        PricingAdjustmentDescription: "Affects base pricing",
        SortOrder: 2
      }
    ],
    InnerException: null,
    StatusCode: 200
  };
}

/**
 * Mock get rate modifications
 * @param {number} scopeId - Scope ID
 * @returns {Object} Mock response
 */
function mockGetRateModifications(scopeId) {
  return {
    IsSuccess: true,
    Message: null,
    Result: [
      {
        RateModificationId: 201,
        Name: "Pet Fee",
        Description: "Additional fee for homes with pets",
        IsPercentage: false,
        IsRequired: false,
        ScopeId: scopeId,
        Cost: 10.00,
        CostDisplay: "$10.00",
        CostCalcType: 0,
        CostCalcDescription: "Flat Fee"
      },
      {
        RateModificationId: 202,
        Name: "Extra Bedroom",
        Description: "Additional fee for each bedroom beyond 3",
        IsPercentage: false,
        IsRequired: false,
        ScopeId: scopeId,
        Cost: 15.00,
        CostDisplay: "$15.00",
        CostCalcType: 0,
        CostCalcDescription: "Flat Fee"
      },
      {
        RateModificationId: 203,
        Name: "New Customer Discount",
        Description: "10% discount for new customers",
        IsPercentage: true,
        IsRequired: false,
        ScopeId: scopeId,
        Cost: -10.00,
        CostDisplay: "-10%",
        CostCalcType: 1,
        CostCalcDescription: "Percentage"
      }
    ],
    InnerException: null,
    StatusCode: 200
  };
}

/**
 * Mock get pricing
 * @param {Object} params - Pricing parameters
 * @returns {Object} Mock response
 */
function mockGetPricing(params) {
  return {
    IsSuccess: true,
    Message: null,
    Result: [
      {
        ScopeId: 101,
        ScopeName: "Regular Cleaning",
        Frequencies: [
          {
            IsBooked: false,
            IsInterested: false,
            FrequencyId: "weekly",
            FrequencyName: "Weekly",
            AdjustedBaseCost: 150.00,
            CalculatedBaseCost: 150.00,
            TotalBaseHours: 3.0,
            TotalRecurringCost: 160.00,
            TotalFirstJobCost: 160.00,
            TotalRecurringHours: 3.2,
            TotalFirstJobHours: 3.2,
            RateModifications: [
              {
                Quantity: 1,
                RateModificationId: 201,
                IsRecurring: true,
                Name: "Pet Fee",
                CalculatedCost: 10.00,
                CalculatedHours: 0.2
              }
            ],
            MinimumCost: 100.00
          },
          {
            IsBooked: false,
            IsInterested: false,
            FrequencyId: "biweekly",
            FrequencyName: "Bi-Weekly",
            AdjustedBaseCost: 170.00,
            CalculatedBaseCost: 170.00,
            TotalBaseHours: 3.5,
            TotalRecurringCost: 180.00,
            TotalFirstJobCost: 180.00,
            TotalRecurringHours: 3.7,
            TotalFirstJobHours: 3.7,
            RateModifications: [
              {
                Quantity: 1,
                RateModificationId: 201,
                IsRecurring: true,
                Name: "Pet Fee",
                CalculatedCost: 10.00,
                CalculatedHours: 0.2
              }
            ],
            MinimumCost: 120.00
          },
          {
            IsBooked: false,
            IsInterested: false,
            FrequencyId: "monthly",
            FrequencyName: "Monthly",
            AdjustedBaseCost: 190.00,
            CalculatedBaseCost: 190.00,
            TotalBaseHours: 4.0,
            TotalRecurringCost: 200.00,
            TotalFirstJobCost: 200.00,
            TotalRecurringHours: 4.2,
            TotalFirstJobHours: 4.2,
            RateModifications: [
              {
                Quantity: 1,
                RateModificationId: 201,
                IsRecurring: true,
                Name: "Pet Fee",
                CalculatedCost: 10.00,
                CalculatedHours: 0.2
              }
            ],
            MinimumCost: 140.00
          }
        ]
      },
      {
        ScopeId: 102,
        ScopeName: "Deep Cleaning",
        Frequencies: [
          {
            IsBooked: false,
            IsInterested: false,
            FrequencyId: "onetime",
            FrequencyName: "One-Time",
            AdjustedBaseCost: 250.00,
            CalculatedBaseCost: 250.00,
            TotalBaseHours: 5.0,
            TotalRecurringCost: 250.00,
            TotalFirstJobCost: 250.00,
            TotalRecurringHours: 5.0,
            TotalFirstJobHours: 5.0,
            RateModifications: [],
            MinimumCost: 200.00
          }
        ]
      }
    ],
    InnerException: null,
    StatusCode: 200
  };
}

/**
 * Mock create lead
 * @param {Object} params - Lead parameters
 * @returns {Object} Mock response
 */
function mockCreateLead(params) {
  return {
    IsSuccess: true,
    Message: "Lead created successfully",
    Result: {
      LeadId: 12345,
      CustomerInformationId: null,
      HomeInformationId: null,
      FirstName: params.FirstName,
      LastName: params.LastName,
      Email: params.Email,
      Phone: params.Phone,
      PostalCode: params.PostalCode,
      StatusId: 1,
      StatusName: "New Lead",
      BaseSiteUrl: "https://example.maidcentral.com",
      MaidServiceQuoteUrl: "https://example.maidcentral.com/quote/12345",
      ActivateUrl: null,
      CustomerSourceId: 1,
      CustomerSourceName: "Website",
      BillingTermsId: null,
      BillingTermsName: null,
      ScopeGroupId: null,
      ScopeGroupName: null,
      HomeAddress1: null,
      HomeAddress2: null,
      HomeCity: null,
      HomeRegion: null,
      HomePostalCode: params.PostalCode,
      BillingAddress1: null,
      BillingAddress2: null,
      BillingCity: null,
      BillingRegion: null,
      BillingPostalCode: null
    },
    InnerException: null,
    StatusCode: 200
  };
}

/**
 * Mock create quote
 * @param {Object} params - Quote parameters
 * @returns {Object} Mock response
 */
function mockCreateQuote(params) {
  return {
    IsSuccess: true,
    Message: "Quote created successfully",
    Result: {
      LeadId: params.LeadId,
      QuoteId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      CustomerInformationId: null,
      HomeInformationId: null,
      FirstName: "John", // This would come from the lead in a real API
      LastName: "Doe",
      Email: "john.doe@example.com",
      Phone: "555-123-4567",
      PostalCode: params.HomePostalCode,
      StatusId: 2,
      StatusName: "Quote Created",
      BaseSiteUrl: "https://example.maidcentral.com",
      MaidServiceQuoteUrl: "https://example.maidcentral.com/quote/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      BookNowUrl: "https://example.maidcentral.com/quote/a1b2c3d4-e5f6-7890-abcd-ef1234567890/book",
      ActivateUrl: null,
      CustomerSourceId: 1,
      CustomerSourceName: "Website",
      BillingTermsId: null,
      BillingTermsName: null,
      ScopeGroupId: params.ScopeGroupId,
      ScopeGroupName: "Residential Cleaning",
      Scopes: [
        {
          ScopeId: 101,
          ScopeName: "Regular Cleaning",
          Frequencies: [
            {
              IsBooked: false,
              IsInterested: true,
              FrequencyId: "weekly",
              FrequencyName: "Weekly",
              AdjustedBaseCost: 150.00,
              CalculatedBaseCost: 150.00,
              TotalBaseHours: 3.0,
              TotalRecurringCost: 150.00,
              TotalFirstJobCost: 150.00,
              TotalRecurringHours: 3.0,
              TotalFirstJobHours: 3.0,
              RateModifications: [],
              MinimumCost: 100.00
            }
          ]
        }
      ],
      HomeSquareFeet: 2000,
      HomeStories: 2.0,
      HomeHasBasement: false,
      HomeBedrooms: 3,
      HomeFullBathrooms: 2,
      HomeHalfBathrooms: 1,
      HomeDirtCode: 2,
      HomePets: 1,
      HomePeople: 4,
      HomeSpecialInstructions: null,
      HomePetInstructions: null,
      HomeSpecialEquipment: null,
      HomeWasteDisposal: null,
      HomeAccessInfo: null,
      HomeAddress1: params.HomeAddress1,
      HomeAddress2: null,
      HomeCity: params.HomeCity,
      HomeRegion: params.HomeRegion,
      HomePostalCode: params.HomePostalCode,
      BillingAddress1: params.HomeAddress1,
      BillingAddress2: null,
      BillingCity: params.HomeCity,
      BillingRegion: params.HomeRegion,
      BillingPostalCode: params.HomePostalCode,
      PECode: null,
      PEStartTime: null,
      PEEndTime: null,
      PEDaysOfWeek: null
    },
    InnerException: null,
    StatusCode: 200
  };
}

/**
 * Mock get availability
 * @param {Object} params - Availability parameters
 * @returns {Object} Mock response
 */
function mockGetAvailability(params) {
  // Create dates for the next 7 days, with morning and afternoon slots
  const dates = [];
  const now = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    
    // Morning slot (9 AM)
    const morningDate = new Date(date);
    morningDate.setHours(9, 0, 0, 0);
    dates.push(morningDate.toISOString());
    
    // Afternoon slot (1 PM)
    const afternoonDate = new Date(date);
    afternoonDate.setHours(13, 0, 0, 0);
    dates.push(afternoonDate.toISOString());
  }
  
  return {
    IsSuccess: true,
    Message: null,
    Result: dates,
    InnerException: null,
    StatusCode: 200
  };
}

/**
 * Mock book quote
 * @param {Object} params - Booking parameters
 * @returns {Object} Mock response
 */
function mockBookQuote(params) {
  return {
    IsSuccess: true,
    Message: "Quote booked successfully",
    Result: {
      LeadId: params.LeadId,
      QuoteId: params.QuoteId,
      CustomerInformationId: 5678,
      HomeInformationId: 9012,
      FirstName: "John", // This would come from the lead in a real API
      LastName: "Doe",
      Email: "john.doe@example.com",
      Phone: "555-123-4567",
      PostalCode: "12345",
      StatusId: 3,
      StatusName: "Booked",
      BaseSiteUrl: "https://example.maidcentral.com",
      MaidServiceQuoteUrl: "https://example.maidcentral.com/quote/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      BookNowUrl: null,
      ActivateUrl: "https://example.maidcentral.com/activate/5678/token",
      CustomerSourceId: 1,
      CustomerSourceName: "Website",
      BillingTermsId: params.BillingTermsId || 1,
      BillingTermsName: "Credit Card",
      ScopeGroupId: params.ScopeGroupId,
      ScopeGroupName: "Residential Cleaning",
      Scopes: [
        {
          ScopeId: 101,
          ScopeName: "Regular Cleaning",
          Frequencies: [
            {
              IsBooked: true,
              IsInterested: true,
              FrequencyId: "weekly",
              FrequencyName: "Weekly",
              AdjustedBaseCost: 150.00,
              CalculatedBaseCost: 150.00,
              TotalBaseHours: 3.0,
              TotalRecurringCost: 160.00,
              TotalFirstJobCost: 160.00,
              TotalRecurringHours: 3.2,
              TotalFirstJobHours: 3.2,
              RateModifications: [
                {
                  Quantity: 1,
                  RateModificationId: 201,
                  IsRecurring: true,
                  Name: "Pet Fee",
                  CalculatedCost: 10.00,
                  CalculatedHours: 0.2
                }
              ],
              MinimumCost: 100.00
            }
          ]
        }
      ],
      HomeSquareFeet: 2000,
      HomeStories: 2.0,
      HomeHasBasement: false,
      HomeBedrooms: 3,
      HomeFullBathrooms: 2,
      HomeHalfBathrooms: 1,
      HomeDirtCode: 2,
      HomePets: 1,
      HomePeople: 4,
      HomeSpecialInstructions: null,
      HomePetInstructions: null,
      HomeSpecialEquipment: null,
      HomeWasteDisposal: null,
      HomeAccessInfo: null,
      HomeAddress1: "123 Main St",
      HomeAddress2: null,
      HomeCity: "Anytown",
      HomeRegion: "CA",
      HomePostalCode: "12345",
      BillingAddress1: "123 Main St",
      BillingAddress2: null,
      BillingCity: "Anytown",
      BillingRegion: "CA",
      BillingPostalCode: "12345",
      PECode: "WEEKLY-MON-AM",
      PEStartTime: "09:00:00",
      PEEndTime: "12:00:00",
      PEDaysOfWeek: ["Monday"]
    },
    InnerException: null,
    StatusCode: 200
  };
}
