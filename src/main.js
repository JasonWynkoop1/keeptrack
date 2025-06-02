// This script initializes the React application
// React and ReactDOM are loaded from CDN in index.html
// App component is defined in App.js and set on the window object

// Function to initialize the app
function initializeApp() {
  try {
    // Check if React, ReactDOM, and App are available
    if (typeof React === 'undefined') {
      console.error('React is not defined. Make sure React is loaded before this script.');
      return;
    }

    if (typeof ReactDOM === 'undefined') {
      console.error('ReactDOM is not defined. Make sure ReactDOM is loaded before this script.');
      return;
    }

    if (typeof App === 'undefined') {
      console.error('App is not defined. Make sure App.js is loaded before this script.');
      return;
    }

    // Get the root element
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Root element not found. Make sure there is an element with id "root" in the HTML.');
      return;
    }

    // Use createRoot API if available (React 18+), otherwise use legacy render
    if (typeof ReactDOM.createRoot === 'function') {
      // React 18+ approach
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(App, null)
        )
      );
      console.log('App initialized with React 18+ createRoot API');
    } else {
      // Legacy approach for older React versions
      ReactDOM.render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(App, null)
        ),
        rootElement
      );
      console.log('App initialized with legacy ReactDOM.render API');
    }

    console.log('App initialized successfully!');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

// Wait for the DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded, initialize immediately
  initializeApp();
}
