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

4. After making changes, redeploy by running:
   ```bash
   npm run deploy
   ```

5. Clear your browser cache or try opening the site in an incognito/private window.

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
