# How to Install OreO 啥都有 as an iOS App

## Prerequisites
1. Make sure your Mac and iPhone are on the same WiFi network
2. The dev server is running at: http://192.168.1.176:3000

## Installation Steps on iOS:

### Method 1: Access via Local Network (Development)
1. **Open Safari** on your iPhone (must use Safari, not Chrome)
2. Go to: `http://192.168.1.176:3000`
3. Tap the **Share button** (square with arrow pointing up)
4. Scroll down and tap **"Add to Home Screen"**
5. Edit the name if needed (default: "OreO 啥都有")
6. Tap **"Add"** in the top right

### Method 2: Deploy to Vercel (Production - Recommended)
1. Deploy your app to Vercel:
   ```bash
   git add .
   git commit -m "Add iOS PWA optimizations"
   git push
   ```
2. Once deployed, open **Safari** on your iPhone
3. Visit: `https://oreohome.vercel.app`
4. Tap the **Share button**
5. Tap **"Add to Home Screen"**
6. Tap **"Add"**

## What You'll Get:

✅ **Full-screen app experience** - No Safari browser UI
✅ **App icon** on your home screen with your cute cat image
✅ **Standalone mode** - Feels like a native app
✅ **Pink status bar** matching your brand
✅ **Smooth gestures** - iOS-optimized touch interactions
✅ **No bounce scrolling** - Feels more app-like
✅ **Works offline** with cached data

## iOS Optimizations Applied:

1. ✅ Apple Web App capable mode
2. ✅ Black translucent status bar
3. ✅ Proper viewport settings (no zoom, no user scaling)
4. ✅ Touch optimizations (no callouts, no highlight)
5. ✅ Overscroll prevention
6. ✅ Apple touch icons for all sizes
7. ✅ PWA manifest for standalone display
8. ✅ Theme color matching your pink brand

## Testing:

After installation, the app should:
- Open in full screen without Safari UI
- Have smooth touch interactions
- Save data locally using localStorage
- Work even when offline (except API calls)
- Show your custom icon on home screen

## Tips:

- Always use **Safari** for "Add to Home Screen" - Chrome/Firefox don't support iOS PWA properly
- The app will remember your data even after closing
- You can delete and reinstall without losing data (it's stored in browser storage)
- For production use, deploy to Vercel first for better performance

Enjoy your native-like iOS app! 🎉
