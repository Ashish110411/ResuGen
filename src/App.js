import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ResumeGenerator from './Resume';

import { DarkModeProvider } from './Resume';

const App = () => {
  return (
    <DarkModeProvider>
      <Router>
        <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
          <Routes>

            {/* Resume builder route */}
            <Route path="/" element={<ResumeGenerator />} />
            
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </div>
      </Router>
    </DarkModeProvider>
  );
};

export default App;
