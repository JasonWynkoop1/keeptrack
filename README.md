# KeepTrack

A React application built with Vite for tracking nutrition and health data.

## Development

This project uses Vite for fast development and building. Here are the available scripts:

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

## Deployment to GitHub Pages

To deploy the full-featured app to GitHub Pages, follow these steps:

1. Make sure your `index.html` file is using the correct module import for the main entry point:
   ```html
   <script type="module" src="./src/main.jsx"></script>
   ```

2. Ensure your `package.json` has the correct homepage field with your GitHub username:
   ```json
   "homepage": "https://YOUR_GITHUB_USERNAME.github.io/keeptrack"
   ```

3. Verify that the `base` path in `vite.config.js` matches your repository name:
   ```javascript
   base: '/keeptrack/', // Replace with your repository name if different
   ```

4. Run the build and deploy commands:
   ```bash
   npm run build
   npm run deploy
   ```

5. After deployment, go to your repository settings on GitHub:
   - Navigate to "Settings" > "Pages"
   - Ensure the "Source" is set to "gh-pages" branch

Your full-featured application will be available at the URL specified in the `homepage` field of your `package.json`.

## Troubleshooting Deployment Issues

If you encounter issues after deployment, check the following:

1. Ensure your `homepage` in `package.json` has your correct GitHub username:
   ```json
   "homepage": "https://YOUR_ACTUAL_USERNAME.github.io/keeptrack"
   ```

2. Make sure paths in `index.html` are using relative paths (starting with `./`) instead of absolute paths (starting with `/`):
   ```html
   <link rel="icon" type="image/svg+xml" href="./vite.svg" />
   <script type="module" src="./src/main.jsx"></script>
   ```

3. If you see MIME type errors like:
   - "Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/css'"
   - "Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/jsx'"
   - "Failed to load resource: the server responded with a status of 404 ()" for node_modules

   This is because GitHub Pages serves files with incorrect MIME types and doesn't include node_modules. To fix this, use relative paths for imports in your components:

   ```javascript
   // In your components, use relative paths to node_modules
   import React from '../node_modules/react/index.js'
   import { createRoot } from '../node_modules/react-dom/client.js'
   ```

   For the main.jsx file, you may need to convert JSX syntax to React.createElement calls:

   ```javascript
   // src/main.jsx
   import React, { StrictMode } from '../node_modules/react/index.js'
   import { createRoot } from '../node_modules/react-dom/client.js'
   import './index.css'
   import App from './App.jsx'

   createRoot(document.getElementById('root')).render(
     React.createElement(
       StrictMode,
       null,
       React.createElement(App, null)
     )
   )
   ```

4. After making changes, redeploy by running:
   ```bash
   npm run deploy
   ```

5. Clear your browser cache or try opening the site in an incognito/private window.

6. Make sure you don't have duplicate .js and .jsx versions of the same file. The full-featured app uses .jsx files:
   ```bash
   # If you find any duplicate .js files, remove them
   rm src/App.js
   rm src/main.js
   ```

7. Make sure all your component imports in App.jsx are using the correct paths. If you previously modified them to use relative paths with node_modules, you may need to change them back to standard imports:
   ```javascript
   // Change this:
   import { useState, useEffect } from '../node_modules/react/index.js'

   // Back to this:
   import { useState, useEffect } from 'react'
   ```

## GitHub Repository Setup

If you haven't pushed this project to GitHub yet:

1. Create a new repository on GitHub named `keeptrack`
2. Connect your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/keeptrack.git
   git branch -M main
   git push -u origin main
   ```

## Technologies Used

- React
- Vite
- Tailwind CSS
- Chart.js
- Axios for API requests
