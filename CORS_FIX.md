# CORS Fix - Local File Loading

## Problem
The app was trying to load `webrtc_adaptor.js` from Ant Media Server (`http://localhost:5080`), which caused CORS errors when importing ES modules from a different origin.

## Solution
Copied the necessary WebRTC files from `/live/js/` to `/public/js/antmedia/` with renamed files to avoid conflicts:

### Files Copied (with `_next` suffix):
- `webrtc_adaptor.js` → `webrtc_adaptor_next.js`
- `webrtc_adaptor-9a40de97.js` → `webrtc_adaptor_next-9a40de97.js`
- `media_manager-a5b1f337.js` → `media_manager_next-a5b1f337.js`
- `soundmeter.js` → `soundmeter_next.js`
- `loglevel.min.js` → `loglevel_next.min.js`
- `utility.js` → `utility_next.js`
- `fetch.stream.js` → `fetch_next.stream.js`
- `external/` folder (adapter-latest.js, etc.)

### Import Paths Updated
All import statements in the copied files have been updated to use the renamed files:
- `./media_manager-a5b1f337.js` → `./media_manager_next-a5b1f337.js`
- `./soundmeter.js` → `./soundmeter_next.js`
- etc.

### Logic Preserved
✅ **No logic changes** - All files contain the exact same code, just with updated import paths to reference the renamed files.

### Loading
The app now loads scripts from `/js/antmedia/` (local Next.js public folder) instead of from the Ant Media Server URL, avoiding CORS issues.

