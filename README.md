# Ant Media Live Stream - Next.js Launcher

A minimal Next.js frontend that automates broadcast creation and redirects to existing Ant Media Server pages. **No WebRTC logic is implemented in Next.js** - all streaming is handled by existing Ant Media HTML files.

## 🎯 Purpose

This app provides a modern UI launcher that:
- Creates broadcasts via Ant Media API
- Redirects users to existing Ant Media publish/play pages
- **Does NOT modify or reimplement any Ant Media streaming logic**

## ✅ What This App Does

1. **Home Page** - Modern UI with "Start Live Stream" button
2. **Creates Broadcast** - Calls `POST /live/rest/v2/broadcasts/create`
3. **Redirects** - Sends user to existing Ant Media pages:
   - Publish: `http://localhost:5080/live/klaso/customIndex.html?id={streamId}`
   - Play: `http://localhost:5080/live/play.html?id={streamId}&playOrder=webrtc`

## ❌ What This App Does NOT Do

- ❌ Reimplement WebRTC logic
- ❌ Modify `webrtc_adaptor.js`
- ❌ Rewrite Ant Media HTML files
- ❌ Create new streaming pages
- ❌ Change Ant Media streaming behavior

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_AMS_URL=http://localhost:5080
   NEXT_PUBLIC_APP_NAME=live
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
/app
  /page.tsx        → Home page (Start Live Stream button)

/lib
  antMediaApi.ts   → API calls (create broadcast, get URLs)
```

**That's it!** No studio pages, no watch pages, no WebRTC code.

## 🔄 Flow

1. User clicks "Start Live Stream" on Next.js home page
2. App calls `POST http://localhost:5080/live/rest/v2/broadcasts/create`
3. App extracts `streamId` from response
4. App redirects to: `http://localhost:5080/live/klaso/customIndex.html?id={streamId}`
5. **All streaming logic handled by existing Ant Media HTML files**

## 🎨 UI Features

- Modern Google Meet-style design
- Smooth animations (Framer Motion)
- Dark theme
- Responsive design

## 🔧 API Integration

Uses `fetch` with `credentials: "include"` as specified:
- No JWT required
- Session cookies supported
- Simple POST request to create broadcast

## 📝 Notes

- Ant Media Server must be running at `http://localhost:5080`
- All streaming pages are existing Ant Media files in `/live/` directory
- Next.js is purely a launcher/automation layer
- No conflicts with existing Ant Media files

## 🎓 Existing Ant Media Pages Used

- **Publish:** `/live/klaso/customIndex.html` (loads `publish.html` in iframe)
- **Play:** `/live/play.html` (existing Ant Media player)

These pages handle all WebRTC logic - we don't touch them!
