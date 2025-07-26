# PAM App Deployment Guide

## 🚀 Deploy to Render

### Prerequisites
1. GitHub account with the PAM app repository
2. Render account (free tier works great)
3. Supabase project with database tables created

### Step-by-Step Deployment

#### 1. Push to GitHub
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial PAM app with founder vision updates"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/pam-app.git
git branch -M main
git push -u origin main
```

#### 2. Connect to Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub account
4. Select your PAM app repository
5. Configure the service:

**Basic Settings:**
- **Name**: `pam-app` (or your preferred name)
- **Environment**: `Node`
- **Region**: `Oregon` (or closest to your users)
- **Branch**: `main`
- **Root Directory**: (leave blank)
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start`

#### 3. Environment Variables
In the Render dashboard, add these environment variables:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`: `https://phlyclrvbrxiszjxorza.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your full key)
- `NODE_ENV`: `production`

#### 4. Deploy
1. Click **"Create Web Service"**
2. Render will automatically build and deploy your app
3. You'll get a live URL like: `https://pam-app-xyz.onrender.com`

### ✅ Auto-Deploy Setup
Once connected, every time you push to GitHub:
```bash
git add .
git commit -m "Update feature X"
git push
```
Render will automatically redeploy your app! 🎉

### 🔧 Troubleshooting

**Build Failures:**
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

**Environment Variable Issues:**
- Double-check Supabase URL and key
- Ensure no extra spaces in environment variables
- Test locally with same environment variables

**Database Connection Issues:**
- Verify Supabase project is active
- Check RLS policies allow access
- Test Supabase connection directly

### 🌟 Benefits of Render
- ✅ Free tier with generous limits
- ✅ Automatic deployments from Git
- ✅ Built-in SSL certificates
- ✅ Easy custom domains
- ✅ Excellent Next.js support
- ✅ Fast global CDN

### 📱 Testing Your Deployed App
Once deployed, test these key features:
1. **Login/Signup** with real Supabase auth
2. **Today tab** with empathetic mum-focused design
3. **Timeline checklist** with Australian immunization schedule
4. **Admin info** with state-specific resources
5. **Mobile responsiveness** on your phone

Your PAM app will be live and accessible to test from anywhere! 🚀