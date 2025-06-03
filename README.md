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

1. Ensure your `package.json` has the correct homepage field with your GitHub username and repository name:
   ```json
   "homepage": "https://YOUR_GITHUB_USERNAME.github.io/keeptrack/"
   ```

2. Verify that the `base` path in `vite.config.js` is set to the repository name:
   ```javascript
   base: '/keeptrack/', // Deploying to GitHub Pages subdirectory
   ```

   Note: The vite.config.js has been updated to increase the chunk size warning limit to 1000 kB:
   ```javascript
   build: {
     chunkSizeWarningLimit: 1000, // Increase the size limit to 1000 kB (1 MB)
   }
   ```
   This addresses the warning about chunks being larger than 500 kB after minification.

3. Make sure you have a `.nojekyll` file in your repository root to prevent GitHub Pages from processing your files with Jekyll:
   ```bash
   touch .nojekyll
   ```

4. Update your build script in `package.json` to copy the `.nojekyll` file to the dist directory:
   ```json
   "build": "vite build && cp .nojekyll dist/"
   ```

5. Run the build and deploy commands:
   ```bash
   npm run build
   npm run deploy
   ```

   If you encounter an error like "A branch named 'gh-pages' already exists", you can run the clean command first:
   ```bash
   npm run clean
   npm run deploy
   ```

   Note: The deployment script has been updated to automatically run the clean step before deployment.

6. After deployment, go to your repository settings on GitHub:
   - Navigate to "Settings" > "Pages"
   - Ensure the "Source" is set to "gh-pages" branch

7. To test your deployment locally before pushing to GitHub, you can use the included script:
   ```bash
   ./test-deploy.sh
   ```
   This will build your app, create the necessary directory structure to match the base path, and start a local server at http://localhost:8082. The script creates a `/keeptrack/` directory inside the `dist` directory and copies the assets there to match the paths expected by the built files.

Your full-featured application will be available at the URL specified in the `homepage` field of your `package.json`.

## Troubleshooting Deployment Issues

If you encounter issues after deployment, check the following:

0. Make sure your index.html file is a proper application entry point and not a redirect page:
   - The index.html file should contain a div with id "root" for React to render into
   - It should include a script tag that imports the main.js file
   - It should NOT contain a meta refresh tag or redirect to dist/index.html
   ```html
   <!doctype html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <link rel="icon" type="image/svg+xml" href="./vite.svg" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Calorie Tracker</title>
     </head>
     <body>
       <div id="root"></div>
       <script type="module" src="./src/main.js"></script>
     </body>
   </html>
   ```

1. Ensure your `homepage` in `package.json` has your correct GitHub username and includes the trailing slash:
   ```json
   "homepage": "https://YOUR_ACTUAL_USERNAME.github.io/keeptrack/"
   ```

2. If you see the error "Failed to resolve module specifier 'react'. Relative references must start with either '/', './', or '../'", this means the browser is trying to load the source files directly instead of the bundled files. Make sure:
   - You have deployed the built files correctly using `npm run deploy`
   - The `.nojekyll` file exists in both your repository root and the dist directory
   - Your `vite.config.js` has the correct base path: `base: '/keeptrack/'`

3. Make sure paths in `index.html` are using relative paths (starting with `./`) instead of absolute paths (starting with `/`):
   ```html
   <link rel="icon" type="image/svg+xml" href="./vite.svg" />
   <script type="module" src="./src/main.js"></script>
   ```

4. If you see 404 errors for assets with paths like `/keeptrack/assets/index-XXX.js` when testing locally, this is because the built files are expecting to be served from a base path of `/keeptrack/` but your local server is serving from the root. You can:
   - Use the updated `test-deploy.sh` script which creates the necessary directory structure
   - Or manually create a `/keeptrack/` directory inside your `dist` directory and copy the assets there:
     ```bash
     mkdir -p dist/keeptrack
     cp -r dist/assets dist/keeptrack/
     cp dist/vite.svg dist/keeptrack/
     ```

5. If you see MIME type errors like:
   - "Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/css'"
   - "Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/jsx'"
   - "Failed to load resource: the server responded with a status of 404 ()" for node_modules

   This is because GitHub Pages serves files with incorrect MIME types and doesn't include node_modules. To fix this, you can:

   a. Create a JavaScript version of your entry point that doesn't use JSX syntax:
   ```javascript
   // src/main.js
   import React, { StrictMode } from 'react'
   import { createRoot } from 'react-dom/client'
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

   b. Update your index.html to reference this .js file instead of the .jsx file:
   ```html
   <script type="module" src="./src/main.js"></script>
   ```

   c. If you're still having issues with module imports, you can use relative paths for imports in your components:
   ```javascript
   // In your components, use relative paths to node_modules
   import React from '../node_modules/react/index.js'
   import { createRoot } from '../node_modules/react-dom/client.js'
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

8. If you encounter authentication errors during deployment, such as "Support for password authentication was removed", see the [GitHub Authentication](#github-authentication) section below for instructions on setting up personal access tokens or SSH keys.

## GitHub Repository Setup

If you haven't pushed this project to GitHub yet:

1. Create a new repository on GitHub named `keeptrack`
2. Connect your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/keeptrack.git
   git branch -M main
   git push -u origin main
   ```

## GitHub Authentication

As of August 13, 2021, GitHub no longer supports password authentication for Git operations. If you encounter an authentication error like this:

```
remote: Support for password authentication was removed on August 13, 2021.
remote: Please see https://docs.github.com/get-started/getting-started-with-git/about-remote-repositories#cloning-with-https-urls for information on currently recommended modes of authentication.
fatal: Authentication failed
```

You need to use one of the following authentication methods:

### Option 1: Personal Access Token (PAT)

1. Create a Personal Access Token on GitHub:
   - Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Click "Generate new token" and select "Classic"
   - Give it a name, set an expiration, and select the necessary scopes (at minimum, select "repo")
   - Click "Generate token" and copy the token (you won't be able to see it again)

2. Use the token as your password when prompted during git operations:
   - Username: your GitHub username
   - Password: your personal access token

3. To avoid being prompted each time, you can store your credentials:
   ```bash
   git config --global credential.helper store
   ```
   Then perform a Git operation that requires authentication. Your credentials will be stored for future use.

### Option 2: SSH Authentication

1. Generate an SSH key pair if you don't have one:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. Add the SSH key to your GitHub account:
   - Copy your public key to clipboard:
     ```bash
     cat ~/.ssh/id_ed25519.pub | pbcopy
     ```
   - Go to GitHub Settings > SSH and GPG keys > New SSH key
   - Paste your key and give it a title

3. Update your repository to use SSH instead of HTTPS:
   ```bash
   git remote set-url origin git@github.com:YOUR_GITHUB_USERNAME/keeptrack.git
   ```

For more information, see [GitHub's documentation on authentication](https://docs.github.com/en/authentication).

## Technologies Used

- React
- Vite
- Tailwind CSS
- Chart.js
- Axios for API requests
