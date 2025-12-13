/**
 * Attom Data API Integration
 * Free tier: 500 requests/day
 * Documentation: https://api.gateway.attomdata.com/docs
 */

export const atomAPI = {
  // Search for property by address
  async searchByAddress(address) {
    const apiKey = process.env.REACT_APP_ATTOM_API_KEY;
    if (!apiKey) {
      console.warn('Attom API key not found - using mock data');
      return null;
    }

    try {
      // Clean and encode the address
      const cleanAddress = address.trim().replace(/,\s*/g, ',');
      const encodedAddress = encodeURIComponent(cleanAddress);

      const response = await fetch(
        `https://api.gateway.attomdata.com/v1/property/lookup?address=${encodedAddress}`,
        {
          headers: {
            'apikey': apiKey,
            'accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 0 && data.property && data.property.length > 0) {
        const property = data.property[0];
        return {
          success: true,
          data: {
            address: property.address.full,
            city: property.address.city,
            state: property.address.state,
            zipCode: property.address.zip,
            county: property.address.county,
            latitude: property.location.latitude,
            longitude: property.location.longitude,
            // Assessor data
            assessedValue: property.assessor?.assessedImprovementValue,
            landValue: property.assessor?.assessedLandValue,
            totalValue: property.assessor?.assessedTotalValue,
            taxAssessmentYear: property.assessor?.taxAssessmentYear,
            // Building details
            yearBuilt: property.building?.yearBuilt,
            area: property.building?.area,
            bedrooms: property.building?.roomsCount,
            bathrooms: property.building?.bathroomsFullCount,
            stories: property.building?.storiesCount,
            // Property type
            propertyType: property.propertyType,
            propertySubType: property.propertySubType,
            // Last sale info
            lastSaleDate: property.sale?.lastSaleDate,
            lastSaleAmount: property.sale?.lastSaleAmount
          }
        };
      }

      return { success: false, message: 'Property not found' };
    } catch (error) {
      console.error('Attom API error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get property assessment details
  async getPropertyDetails(propertyId) {
    const apiKey = process.env.REACT_APP_ATTOM_API_KEY;
    if (!apiKey) return null;

    try {
      const response = await fetch(
        `https://api.gateway.attomdata.com/v1/property/assessment?propertyId=${propertyId}`,
        {
          headers: {
            'apikey': apiKey,
            'accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      return data.property || null;
    } catch (error) {
      console.error('Error fetching property details:', error);
      return null;
    }
  },

  // Get recent sales in the area
  async getNearbySales(address, radius = 1) {
    const apiKey = process.env.REACT_APP_ATTOM_API_KEY;
    if (!apiKey) return null;

    try {
      const cleanAddress = address.trim().replace(/,\s*/g, ',');
      const encodedAddress = encodeURIComponent(cleanAddress);

      const response = await fetch(
        `https://api.gateway.attomdata.com/v1/sales/assessment?address=${encodedAddress}&radius=${radius}&pageSize=10`,
        {
          headers: {
            'apikey': apiKey,
            'accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      return data.sales || [];
    } catch (error) {
      console.error('Error fetching nearby sales:', error);
      return [];
    }
  }
};

// Helper function to estimate property value when API isn't available
export const getPropertyEstimate = (address, propertyType) => {
  // Mock estimate based on property type and location patterns
  const baseEstimates = {
    residential: 350000,
    commercial: 850000,
    land: 200000,
    rental: 450000,
    condo: 280000,
    townhouse: 320000
  };

  // Add some variance based on address patterns
  let multiplier = 1;
  const lowerAddress = address.toLowerCase();

  // City-based adjustments (mock data)
  if (lowerAddress.includes('new york') || lowerAddress.includes('manhattan')) multiplier = 3;
  if (lowerAddress.includes('san francisco') || lowerAddress.includes('palo alto')) multiplier = 2.5;
  if (lowerAddress.includes('los angeles') || lowerAddress.includes('beverly hills')) multiplier = 2;
  if (lowerAddress.includes('miami') || lowerAddress.includes('seattle')) multiplier = 1.5;
  if (lowerAddress.includes('chicago')) multiplier = 1.3;
  if (lowerAddress.includes('boston')) multiplier = 1.4;
  if (lowerAddress.includes('atlanta')) multiplier = 1.2;
  if (lowerAddress.includes('denver')) multiplier = 1.25;
  if (lowerAddress.includes('portland')) multiplier = 1.35;

  // Property type adjustments
  if (lowerAddress.includes('condo') || lowerAddress.includes('apartment')) multiplier *= 0.7;
  if (lowerAddress.includes('mansion') || lowerAddress.includes('estate')) multiplier *= 2;
  if (lowerAddress.includes('mobile')) multiplier *= 0.3;
  if (lowerAddress.includes('lake') || lowerAddress.includes('ocean')) multiplier *= 1.5;
  if (lowerAddress.includes('downtown') || lowerAddress.includes('city center')) multiplier *= 1.2;

  const baseValue = baseEstimates[propertyType] || baseEstimates.residential;
  const estimatedValue = Math.floor(baseValue * multiplier);

  // Generate mock details for demonstration
  const mockDetails = {
    yearBuilt: 1980 + Math.floor(Math.random() * 40),
    area: 1500 + Math.floor(Math.random() * 2500),
    bedrooms: 2 + Math.floor(Math.random() * 4),
    bathrooms: 1 + Math.floor(Math.random() * 3),
    lastSold: `${2015 + Math.floor(Math.random() * 8)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`,
    lastSaleAmount: Math.floor(estimatedValue * (0.7 + Math.random() * 0.3))
  };

  return {
    price: estimatedValue,
    currency: 'USD',
    source: 'AI Estimate',
    confidence: 'low',
    message: 'This is a rough estimate based on location and property type. Add an Attom API key for accurate valuations.',
    details: mockDetails
  };
};