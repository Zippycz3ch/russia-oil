# Firebase & GitHub Pages Setup Guide

## Part 1: Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "russia-oil-tracker")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firestore Database

1. In Firebase Console, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location
5. Click "Enable"

### 3. Set Firestore Security Rules

Go to "Firestore Database" > "Rules" and set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all
    match /{document=**} {
      allow read: if true;
    }

    // Allow write only to authenticated users (you can customize this)
    match /facilities/{facility} {
      allow write: if request.auth != null;
    }

    match /hits/{hit} {
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Get Firebase Web Configuration

1. Go to Project Settings (gear icon) > "General"
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register app with nickname (e.g., "russia-oil-frontend")
5. Copy the `firebaseConfig` object

### 5. Configure Frontend

Create `frontend/.env`:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_URL=http://localhost:5000
```

### 6. Get Firebase Admin SDK (Backend)

1. Go to Project Settings > "Service accounts"
2. Click "Generate new private key"
3. Save the JSON file as `backend/serviceAccountKey.json`
4. **IMPORTANT:** Add `serviceAccountKey.json` to `.gitignore`!

### 7. Initialize Data

Option A: Using the API endpoint

```bash
# Start the backend
cd backend
npm run dev

# In another terminal, initialize data
curl -X POST http://localhost:5000/api/facilities/init
```

Option B: Using Firebase Console

- Go to Firestore Database
- Manually import your facilities data

## Part 2: GitHub Pages Deployment

### 1. Prepare Frontend for GitHub Pages

1. Update `frontend/package.json`:

```json
{
  "homepage": "https://Zippycz3ch.github.io/russia-oil",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

2. Install gh-pages:

```bash
cd frontend
npm install --save-dev gh-pages
```

3. Update API URL in production:

Create `frontend/.env.production`:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_URL=https://your-backend-url.com
```

### 2. Deploy Frontend to GitHub Pages

```bash
cd frontend
npm run deploy
```

This will:

- Build the production version
- Create a `gh-pages` branch
- Push the built files to GitHub

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Go to "Settings" > "Pages"
3. Under "Source", select branch `gh-pages` and folder `/ (root)`
4. Click "Save"
5. Your site will be available at: `https://Zippycz3ch.github.io/russia-oil`

## Part 3: Backend Deployment Options

### Option A: Firebase Cloud Functions (Recommended for Firebase)

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login and initialize:

```bash
firebase login
firebase init functions
```

3. Deploy:

```bash
firebase deploy --only functions
```

### Option B: Heroku

1. Create `backend/Procfile`:

```
web: npm start
```

2. Deploy:

```bash
cd backend
heroku create russia-oil-backend
git push heroku main
```

### Option C: Railway/Render

1. Connect your GitHub repo
2. Set environment variables
3. Deploy automatically

## Part 4: Environment Variables for Production

### For Backend (Heroku/Railway/Render):

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
PORT=5000
NODE_ENV=production
```

### For Frontend (already set in .env.production):

Update `REACT_APP_API_URL` to your deployed backend URL.

## Testing

1. **Local Development:**

   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend (in another terminal)
   cd frontend
   npm run dev
   ```

2. **Initialize Data:**

   ```bash
   curl -X POST http://localhost:5000/api/facilities/init
   ```

3. **Test API:**

   ```bash
   curl http://localhost:5000/api/facilities
   ```

4. **Access Frontend:**
   - Local: http://localhost:3000
   - GitHub Pages: https://Zippycz3ch.github.io/russia-oil

## Security Checklist

- [ ] `serviceAccountKey.json` is in `.gitignore`
- [ ] Environment variables are not committed to git
- [ ] Firestore security rules are configured
- [ ] CORS is properly configured in backend
- [ ] Admin authentication is implemented

## Troubleshooting

### Firebase Connection Issues

- Check if `serviceAccountKey.json` exists
- Verify Firebase configuration in `.env`
- Check Firestore security rules

### GitHub Pages 404 Error

- Ensure `homepage` in `package.json` is correct
- Check if `gh-pages` branch was created
- Verify GitHub Pages settings

### CORS Errors

- Update backend CORS configuration to allow your GitHub Pages URL
- Add `https://Zippycz3ch.github.io` to allowed origins

## Next Steps

1. Set up Firebase Authentication for admin panel
2. Implement API rate limiting
3. Add monitoring and analytics
4. Set up automatic backups
5. Implement CI/CD pipeline
