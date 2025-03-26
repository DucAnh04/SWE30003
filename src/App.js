// Example: src/App.js or src/Routes.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PaymentPage from './PaymentPage';
import Home from './Home'
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import ContactUsPage from './ContactUsPage'
import FeedbackPage from './FeedbackPage';
function App() {
  return (
    <BrowserRouter>
    
      {/* Navigation Bar */}
      <NavigationBar />

      <Routes>
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
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
