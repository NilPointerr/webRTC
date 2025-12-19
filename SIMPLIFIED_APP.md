# Simplified Next.js App - Launcher Only

## ✅ What Was Done

The app has been **completely simplified** to act as a launcher only:

### Removed
- ❌ All WebRTC logic from Next.js
- ❌ Studio page (`/app/studio/[id]/page.tsx`)
- ❌ Watch page (`/app/watch/[id]/page.tsx`)
- ❌ WebRTC integration (`/lib/webrtc.ts`)
- ❌ All React components (VideoPreview, ControlBar, StatusBadge)
- ❌ Axios dependency (using native `fetch` instead)

### Kept (Minimal)
- ✅ Home page (`/app/page.tsx`) - Just a button
- ✅ API helper (`/lib/antMediaApi.ts`) - Only create broadcast + get URLs
- ✅ Modern UI with animations

## 🎯 Flow

1. User visits `http://localhost:3000`
2. Clicks "Start Live Stream"
3. App calls: `POST http://localhost:5080/live/rest/v2/broadcasts/create`
   - Uses `fetch` with `credentials: "include"`
   - No JWT, no authentication
4. App extracts `streamId` from response
5. App redirects to: `http://localhost:5080/live/klaso/customIndex.html?id={streamId}`
6. **All streaming handled by existing Ant Media HTML files**

## 📁 Final Structure

```
/app
  /page.tsx        → Home page (Start button)

/lib
  antMediaApi.ts   → createBroadcast() + getPublishUrl()
```

## 🔗 Redirects To

- **Publish:** `http://localhost:5080/live/klaso/customIndex.html?id={streamId}`
  - This existing page loads `publish.html` in an iframe
  - All WebRTC logic is in Ant Media's existing files
  
- **Play:** `http://localhost:5080/live/play.html?id={streamId}&playOrder=webrtc`
  - Existing Ant Media player page

## ✅ Constraints Met

- ✅ No WebRTC logic in Next.js
- ✅ No modifications to Ant Media files
- ✅ Uses existing Ant Media HTML pages
- ✅ Only UI + flow automation
- ✅ Uses `fetch` with `credentials: "include"`
- ✅ No JWT required

## 🚀 Ready to Use

1. Set `.env.local`:
   ```env
   NEXT_PUBLIC_AMS_URL=http://localhost:5080
   NEXT_PUBLIC_APP_NAME=live
   ```

2. Run: `npm run dev`

3. Open: `http://localhost:3000`

4. Click "Start Live Stream" → Redirects to Ant Media publish page

**That's it!** Next.js is purely a launcher. All streaming is handled by Ant Media Server's existing files.

