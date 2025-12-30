# Backend Deployment Guide for Render

## Deployment Steps

### 1. Push to GitHub
Make sure your code is pushed to GitHub with the latest changes.

### 2. Connect to Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository

### 3. Configure Build Settings
Use these settings in Render:

- **Name**: `community-help-portal-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `Backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 4. Environment Variables
Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=3000
DB_HOST=your_railway_host
DB_PORT=your_railway_port
DB_USER=your_railway_user
DB_PASSWORD=your_railway_password
DB_NAME=your_railway_database
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
FRONTEND_URL=https://your-frontend.vercel.app
```

### 5. Deploy
Click "Create Web Service" and Render will automatically build and deploy your backend.

## Troubleshooting

### Error: Cannot find module '/opt/render/project/src/dist/server.js'
**Solution**: Make sure:
- Build command includes `npm run build`
- Root directory is set to `Backend`
- `postinstall` script runs the build

### Build Fails
**Solution**: Check that all dependencies are in `dependencies` (not just `devDependencies`)

### Database Connection Issues
**Solution**: Verify all database environment variables are set correctly in Render dashboard

## Local Testing
Test the production build locally:
```bash
npm run build
npm start
```

## Monitoring
- Check logs in Render dashboard
- Monitor at: https://your-app.onrender.com/api/health
