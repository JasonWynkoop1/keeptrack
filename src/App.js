// Simple App component that sets itself on the global window object
// This avoids the need for import/export which can cause MIME type issues

// Create a simple App component
window.App = function() {
  return window.React.createElement(
    'div',
    { className: 'app-container' },
    window.React.createElement(
      'h1',
      null,
      'Calorie Tracker'
    ),
    window.React.createElement(
      'p',
      null,
      'This is a simplified version of the app to test deployment.'
    )
  );
};