# KeepTrack

A React application built with Vite for tracking nutrition and health data.

## Development

This project uses Vite for fast development and building. Here are the available scripts:

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

## Deployment to GitHub Pages

This project is configured for deployment to GitHub Pages. Before deploying, make sure to:

1. Update the `homepage` field in `package.json` with your GitHub username:
   ```json
   "homepage": "https://YOUR_GITHUB_USERNAME.github.io/keeptrack"
   ```

2. Verify that the `base` path in `vite.config.js` matches your repository name:
   ```javascript
   base: '/keeptrack/', // Replace with your repository name if different
   ```

3. Deploy the application by running:
   ```bash
   npm run deploy
   ```

4. After deployment, go to your repository settings on GitHub:
   - Navigate to "Settings" > "Pages"
   - Ensure the "Source" is set to "gh-pages" branch

Your application will be available at the URL specified in the `homepage` field of your `package.json`.

## Troubleshooting Deployment Issues

If you encounter a white screen or 404 errors after deployment, check the following:

1. Ensure your `homepage` in `package.json` has your correct GitHub username:
   ```json
   "homepage": "https://YOUR_ACTUAL_USERNAME.github.io/keeptrack"
   ```

2. Make sure paths in `index.html` are using relative paths (starting with `./`) instead of absolute paths (starting with `/`):
   ```html
   <link rel="icon" type="image/svg+xml" href="./vite.svg" />
   <script type="module" src="./src/main.js"></script>
   ```

3. If you see a MIME type error like "Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of 'text/jsx'", make sure your script tag in `index.html` references a `.js` file extension instead of `.jsx`:
   ```html
   <!-- Change this: -->
   <script type="module" src="./src/main.jsx"></script>

   <!-- To this: -->
   <script type="module" src="./src/main.js"></script>
   ```

4. If you encounter a build error like "Failed to resolve ./src/main.js", ensure that the file referenced in your HTML actually exists. You may need to:
   - Create a new file with the correct extension (e.g., create `main.js` if you only have `main.jsx`)
   - Or change the reference in `index.html` to match your actual file name

5. If you see an error like "Failed to parse source for import analysis because the content contains invalid JS syntax", it means you're using JSX syntax in a .js file. You have two options:
   - Rename the file to have a .jsx extension and update references to it
   - Or convert the JSX syntax to use React.createElement() instead:
   ```javascript
   // Instead of this JSX syntax:
   createRoot(document.getElementById('root')).render(
     <StrictMode>
       <App />
     </StrictMode>
   )

   // Use this JavaScript syntax:
   createRoot(document.getElementById('root')).render(
     React.createElement(
       StrictMode,
       null,
       React.createElement(App, null)
     )
   )
   ```

6. After making changes, redeploy by running:
   ```bash
   npm run deploy
   ```

7. If you see an error like "Failed to resolve module specifier 'react'. Relative references must start with either '/', './', or '../'", you have two options:

   **Option 1: Use relative paths for imports**
   ```javascript
   // Change this:
   import React, { StrictMode } from 'react'
   import { createRoot } from 'react-dom/client'

   // To this:
   import React, { StrictMode } from '../node_modules/react/index.js'
   import { createRoot } from '../node_modules/react-dom/client.js'
   ```

   You may need to update imports in multiple files, including:
   - src/App.jsx
   - src/components/BarcodeScanner.jsx
   - src/components/MacrosDashboard.jsx
   - src/components/ui/card.jsx
   - src/components/ui/tabs.jsx
   - src/components/ui/button.jsx
   - src/lib/utils.js

   For third-party libraries, the path might vary. Here are some examples:
   ```javascript
   // For lucide-react icons
   import { ScanLine, Search } from '../node_modules/lucide-react/dist/esm/index.js'

   // For chart.js
   import { Chart as ChartJS } from '../node_modules/chart.js/dist/chart.js'

   // For tailwind utilities
   import { twMerge } from '../node_modules/tailwind-merge/dist/index.js'
   ```

   **Option 2: Use CDN for React and avoid ES modules (recommended for GitHub Pages)**

   If you're still experiencing MIME type errors like:
   - "Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/css'"
   - "Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/jsx'"

   You can switch to using CDN for React and regular scripts instead of ES modules:

   1. Update index.html to load React from CDN and include your CSS directly:
   ```html
   <head>
     <!-- Other head elements -->
     <link rel="stylesheet" href="./src/index.css" />
     <!-- Load React and ReactDOM from CDN -->
     <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
     <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
   </head>
   <body>
     <div id="root"></div>
     <!-- Load your scripts as regular scripts, not modules -->
     <script src="./src/App.js"></script>
     <script src="./src/main.js"></script>
   </body>
   ```

   2. Create a simplified App.js that uses global variables:
   ```javascript
   // Create a simple App component
   window.App = function() {
     return React.createElement(
       'div',
       { className: 'app-container' },
       React.createElement('h1', null, 'Your App Title')
     );
   };
   ```

   3. Update main.js to use regular script syntax:
   ```javascript
   document.addEventListener('DOMContentLoaded', function() {
     ReactDOM.createRoot(document.getElementById('root')).render(
       React.createElement(
         React.StrictMode,
         null,
         React.createElement(App, null)
       )
     );
   });
   ```

   This approach avoids MIME type issues by not using ES modules at all.

8. Clear your browser cache or try opening the site in an incognito/private window.

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
