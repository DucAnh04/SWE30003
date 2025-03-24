// Example: src/App.js or src/Routes.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PaymentPage from './components/PaymentPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaymentPage />} />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;