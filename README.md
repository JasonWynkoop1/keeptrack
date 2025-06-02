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

7. If you see an error like "Failed to resolve module specifier 'react'. Relative references must start with either '/', './', or '../'", you need to update your import statements to use relative paths:
   ```javascript
   // Change this:
   import React, { StrictMode } from 'react'
   import { createRoot } from 'react-dom/client'

   // To this:
   import React, { StrictMode } from '../node_modules/react/index.js'
   import { createRoot } from '../node_modules/react-dom/client.js'
   ```

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
