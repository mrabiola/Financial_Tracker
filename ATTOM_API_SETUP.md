# 🏠 Attom Data API Setup for Real Estate Valuations

## Overview
We've integrated **Attom Data API** for real estate property valuations. This provides accurate property data including assessed values, building details, and recent sales information.

## Free Tier Benefits
- **500 requests per day** (very generous!)
- **No credit card required**
- **Comprehensive property data**
- **Works in JavaScript** (no backend needed)

## Quick Setup (2 minutes)

### Step 1: Get Free Attom API Key
1. Visit: https://developer.attomdata.com/
2. Click **"Sign Up"** or **"Get Started"**
3. Create a free account
4. Go to your dashboard → API Keys
5. Copy your API key

### Step 2: Add API Key to Your App
1. Open your `.env` file in the project root
2. Add your Attom API key:

```env
REACT_APP_ATTOM_API_KEY=your_actual_api_key_here
```

3. Save the file
4. Restart your development server:
```bash
npm start
```

### Step 3: Test the Real Estate Feature
1. Open WealthTrak in your browser
2. Click **"Add Asset"**
3. Type "My House" (or any real estate keywords)
4. Enter your property address (e.g., "123 Main St, Anytown, CA")
5. Click **"Get Value Estimate"**
6. View detailed property information!

## What Data You Get

### ✅ With API Key (High Confidence):
- **Assessed Value**: Official property tax assessment
- **Building Details**: Year built, square footage, rooms
- **Location Data**: Address, city, state, ZIP
- **Sale History**: Last sale date and amount
- **Property Type**: Residential, commercial, land
- **Accurate Valuations**: Based on public records

### ⚠️ Without API Key (Low Confidence):
- **Rough Estimates**: Based on property type and location
- **City Adjustments**: Uses location-based multipliers
- **Property Type Adjustments**: Condos, mansions, etc.
- **Estimated Range**: Provides realistic ballpark figures

## Sample Property Address Formats

The API accepts various address formats:

```
✅ "123 Main St, Los Angeles, CA 90001"
✅ "456 Oak Avenue, New York, NY 10001"
✅ "789 Pine Lane, Chicago, IL 60601"
✅ "321 Elm Street, Miami FL 33101"
```

## API Usage Tips

### To Maximize Your Free Tier:
1. **Search specific addresses** - exact addresses work best
2. **Batch property additions** - add multiple properties at once
3. **Save property data** - store for historical tracking
4. **Refresh strategically** - update values quarterly or annually

### Property Types Supported:
- ✅ Single Family Homes
- ✅ Condos/Apartments
- ✅ Townhouses
- ✅ Multi-family buildings
- ✅ Commercial properties
- ✅ Land parcels
- ✅ Rental properties

## Error Handling

The system includes smart fallbacks:
- **API Failure**: Falls back to intelligent estimates
- **Address Not Found**: Shows rough estimate based on location
- **Rate Limits**: Handles 429 errors gracefully
- **Network Issues**: Provides offline estimates

## Privacy & Security

- Addresses are only sent to Attom for valuation
- No personal data is stored by Attom
- Property data comes from public records
- All API calls are encrypted (HTTPS)

## Troubleshooting

### "Property not found" error:
- Try a more specific address
- Include ZIP code if possible
- Check if the property is too new

### "Rate limit exceeded":
- You've used your 500 daily requests
- Wait until tomorrow (resets at midnight UTC)
- Consider upgrading to a paid plan if needed

### "Invalid API key":
- Double-check your API key in `.env`
- Ensure no extra spaces or characters
- Verify your account is active

## Alternative APIs

If you prefer other providers:
1. **Estated API** - Property estimates
2. **CoreLogic API** - Professional real estate data
3. **Redfin API** - Free tier available

## Need Help?

1. Check console logs (F12 in browser)
2. Verify API key is correct
3. Test with known addresses
4. Contact support at customerservice@techbrov.com

---

**Enjoy accurate property valuations! 🏠✨**

The system works perfectly without an API key using intelligent estimates,
but gets significantly more accurate with real data!