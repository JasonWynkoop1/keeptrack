// React and ReactDOM are loaded from CDN in index.html
// App is defined in App.js and set on the window object
// This script is loaded as a regular script, not a module

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Access React and ReactDOM from the global scope (loaded via CDN)
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(
      React.StrictMode,
      null,
      React.createElement(App, null)
    )
  );
});
