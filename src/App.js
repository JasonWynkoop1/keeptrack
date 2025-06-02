// Simple App component that sets itself on the global window object
// This avoids the need for import/export which can cause MIME type issues

// Create a simple App component
window.App = function() {
  return React.createElement(
    'div',
    { className: 'app-container', style: { 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }},
    React.createElement(
      'h1',
      { style: { color: '#333', marginBottom: '20px' } },
      'Calorie Tracker'
    ),
    React.createElement(
      'p',
      { style: { color: '#666', marginBottom: '30px' } },
      'This is a simplified version of the app to test deployment.'
    ),
    React.createElement(
      'div',
      { style: { 
        padding: '20px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }},
      React.createElement(
        'h2',
        { style: { color: '#333', marginBottom: '15px' } },
        'Deployment Successful!'
      ),
      React.createElement(
        'p',
        { style: { color: '#666' } },
        'If you can see this message, the app has been successfully deployed to GitHub Pages.'
      )
    )
  );
};