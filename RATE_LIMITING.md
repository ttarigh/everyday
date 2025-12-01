# Rate Limiting for Tagged Posts

## Overview
This document describes the rate limiting system implemented for the tagged posts feature.

## Rate Limits
- **Per IP Address**: 1 post per day maximum per IP address (prevents users from bypassing limits by changing Instagram handles)
- **Global**: 10 posts per day total using the default API key
- **With Custom API Key**: No rate limits (users can bring their own Gemini API key)

Note: Instagram handles are still tracked for analytics and anti-spam purposes, but the primary rate limiting is done by IP address.

## How It Works

### Backend (API)
1. **Rate Limit Tracking** (`data/rate-limits.json`)
   - Tracks daily counts per IP address, per user handle, and globally
   - Automatically resets at the start of each new day
   - Stored in GitHub repository alongside other data

2. **IP Address Detection**
   - Extracts client IP from request headers (`x-forwarded-for`, `x-real-ip`)
   - Works with deployment platforms like Vercel, CloudFlare, etc.
   - Falls back to socket remote address if headers not present

3. **Rate Limit Checking** (`pages/api/create-tagged-post.js`)
   - Before processing a post, the API checks:
     - If IP address has reached its daily limit (1 post/day) - **Primary check**
     - If site has reached the global daily limit (10 posts/day)
   - Instagram handles are tracked but not used for primary rate limiting
   - If rate limit is exceeded, returns a 429 error with explanation
   - If user provides their own API key, rate limits are bypassed

3. **Custom API Keys**
   - Users can provide their own Gemini API key
   - Custom keys bypass all rate limits
   - Keys are only used for the specific request (not stored)

### Frontend (UI)
1. **Rate Limit Detection**
   - When the API returns a 429 error, the modal displays a helpful message
   - Shows which limit was exceeded (user or global)

2. **API Key Input**
   - When rate limit is hit, an input field appears for the user's API key
   - Users can also manually toggle the API key input at any time
   - Includes a clickable link to get an API key: [https://aistudio.google.com/app/api-keys](https://aistudio.google.com/app/api-keys)

3. **User Experience**
   - Clear messaging: "This site is pretty popular! Bring your own API key"
   - Password-style input for API key security
   - Reassurance that the API key is not stored

## Files Modified
1. `data/rate-limits.json` - New file for tracking rate limits
2. `pages/api/create-tagged-post.js` - Added rate limiting logic and custom API key support
3. `pages/index.js` - Updated TaggedPostModal to handle rate limits and accept custom API keys

## Testing
To test the rate limiting:
1. Try creating a tagged post - should work normally
2. Try creating another post (even with a different Instagram handle) - should be rate limited by IP address
3. Try creating posts from different IPs until the global limit (10) is reached
4. After hitting rate limit, provide a custom Gemini API key - should work again

Note: During development on localhost, all requests may appear to come from the same IP (127.0.0.1 or ::1).

## Rate Limit Reset
Rate limits automatically reset at midnight (UTC) each day based on the ISO date string comparison.

