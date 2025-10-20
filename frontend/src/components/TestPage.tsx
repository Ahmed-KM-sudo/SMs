import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Frontend Test Page</h1>
      <p className="mb-4">If you see this, your React frontend is working!</p>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Backend Test</h2>
          <button 
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:8000/api/v1/health');
                const data = await response.json();
                console.log('Backend response:', data);
                alert('Backend is working! Check console for details.');
              } catch (error) {
                console.error('Backend error:', error);
                alert('Backend connection failed. Check console for details.');
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Backend Connection
          </button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Queue Dashboard Test</h2>
          <button 
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:8000/api/v1/queue/stats');
                const data = await response.json();
                console.log('Queue stats:', data);
                alert('Queue API is working! Check console for details.');
              } catch (error) {
                console.error('Queue API error:', error);
                alert('Queue API failed. Check console for details.');
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Queue API
          </button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Navigation Test</h2>
          <div className="space-x-2">
            <a href="/queue" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 inline-block">
              Go to Queue Dashboard
            </a>
            <a href="/messages" className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 inline-block">
              Go to Messages Timeline
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
