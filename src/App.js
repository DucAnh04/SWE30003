// Example: src/App.js or src/Routes.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PaymentPage from './PaymentPage';
import Home from './Home'
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
function App() {
  return (
    <BrowserRouter>
    
      {/* Navigation Bar */}
      <NavigationBar />

      <Routes>

        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/" element={<Home />} />

        {/* Other routes */}
      </Routes>

      {/* Footer */}
      <Footer />

    </BrowserRouter>
  );
}

export default App;