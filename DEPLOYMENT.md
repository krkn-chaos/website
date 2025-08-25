# 🚀 Krkn Chatbot Deployment Guide

## Overview

- **Frontend** ✅ Deploys automatically with Hugo when PR is merged
- **Backend API** 🔧 Needs separate deployment (this guide)

## 🛠️ API Deployment Options

### Option 1: Railway (Recommended - Easy + Free Tier)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
cd api/
railway login
railway init
railway up

# 3. Set environment variables in Railway dashboard
railway variables set LLM_API_KEY=your-gemini-key
railway variables set ALLOWED_ORIGINS=https://krkn-chaos.dev
```

### Option 2: Render (Free Tier Available)

1. Connect GitHub repo to Render
2. Create new Web Service
3. Build command: `cd api && npm install`
4. Start command: `cd api && npm start`
5. Set environment variables in dashboard

### Option 3: Vercel (Serverless Functions)

```bash
cd api/
npx vercel

# Set environment variables
vercel env add LLM_API_KEY
vercel env add ALLOWED_ORIGINS
```

### Option 4: DigitalOcean App Platform

1. Connect GitHub repo
2. Detect Node.js app in `/api` folder
3. Set environment variables in dashboard

## 🔗 Connect Frontend to API

### Method 1: Same Domain (Recommended)

Deploy API to `https://krkn-chaos.dev/api/` - no frontend changes needed!

**Railway/Render**: Set custom domain to `krkn-chaos.dev` with `/api` path

### Method 2: Separate Domain

If API is on different domain, update frontend:

```javascript
// In static/js/chatbot.js, line 5:
this.apiEndpoint = 'https://your-api.railway.app/api/chat';
```

## ⚙️ Production Configuration

### 1. Set Environment Variables

```bash
# Required
LLM_API_KEY=your-gemini-api-key

# Recommended  
ALLOWED_ORIGINS=https://krkn-chaos.dev
NODE_ENV=production
PORT=3001
```

### 2. Update CORS Settings

In `api/config.js` - already configured to read from `ALLOWED_ORIGINS` env var.

## 🚀 Quick Deploy Commands

### Railway (Easiest)
```bash
cd api/
npm install -g @railway/cli
railway login
railway init --name krkn-chatbot-api
railway up
# Set LLM_API_KEY and ALLOWED_ORIGINS in dashboard
```

### Render (Web UI)
1. Go to render.com
2. "New Web Service" 
3. Connect GitHub repo
4. Root directory: `api`
5. Build: `npm install`
6. Start: `npm start`

## ✅ Verify Deployment

1. **Test API**: `curl https://your-api-url/api/health`
2. **Test Chat**: Visit your site, click chat button
3. **Check Logs**: Monitor for errors

## 🐛 Troubleshooting

- **CORS Error**: Add your domain to `ALLOWED_ORIGINS`
- **503 Error**: Check if API is running and healthy
- **No AI Response**: Verify `LLM_API_KEY` is set correctly
- **404 Error**: Ensure API endpoint URL is correct

## 📱 Mobile/HTTPS Notes

- API must be HTTPS for production websites
- Most hosting services provide HTTPS automatically
- Test on mobile devices after deployment

