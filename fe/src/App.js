import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate  } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import PaymentPage from './PaymentPage';
import Home from './Home';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import ContactUsPage from './ContactUsPage';
import FeedbackPage from './FeedbackPage';
import ProfileManagementPage from './ProfilePage';
import RideRequestModal from './components/RideRequestModal';
import { jwtDecode } from "jwt-decode";
import RidesTable from './Ride';
import AdminDashboard from './Admin';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [ws, setWs] = useState(null);
  const [rideRequestModal, setRideRequestModal] = useState({
    isOpen: false,
    rideInfo: null
  });

  useEffect(() => {
    if (localStorage.getItem("token") !== null) {
      let client_id = localStorage.getItem("client_id");
      
      if (!client_id) {
        client_id = parseInt(uuidv4().split('-')[0], 16) % 1000000;
        localStorage.setItem("client_id", client_id);
      }
      const token = localStorage.getItem("token");
      const user_type = jwtDecode(token).user_type;
      const user_id = jwtDecode(token).user_id;
      const newWs = new WebSocket(`ws://localhost:8000/ws/${user_type}/${client_id}/${user_id}`);
      

      newWs.onmessage = (event) => {
        try {
          // Parse the incoming message
          const message = JSON.parse(event.data);
          console.log("Received WebSocket message:", message);

          // Check if it's a ride request
          if (message.type === 'findDriver') {
            setRideRequestModal({
              isOpen: true,
              rideInfo: message.ride_info
            });
          } else if(message.type === 'driverResponse'){
             console.log('driveResponse')
             if(message.accepted){
                alert('Driver accepted ride')
                window.location.href = '/ride'; 
             }
          }


        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };
      
      setWs(newWs);
      
      return () => newWs.close(); // Cleanup on unmount
    }
  }, []);

  const handleRideRequestClose = (accepted, sendMessage = true) => {
    // Only send message if sendMessage is true
    if (sendMessage && ws) {
      ws.send(JSON.stringify({
        type: 'driverResponse',
        accepted: accepted,
        rideInfo: rideRequestModal.rideInfo
      }));
    }
  
    // Close the modal
    setRideRequestModal({
      isOpen: false,
      rideInfo: null
    });
  };

  return (
    <>
      <BrowserRouter>
        <NavigationBar />
        
        <Routes>
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/payment/:id" element={<PaymentPage />} />
          <Route path="/" element={<Home ws={ws}/>} />
          <Route path="/profile" element={<ProfileManagementPage />} />
          <Route path="/ride" element={<RidesTable ws={ws} />} />
          <Route 
            path="/admin" 
            element={<PrivateRoute element={<AdminDashboard />} />} 
          />
        </Routes>
        
        <Footer />
      </BrowserRouter>

      <RideRequestModal 
        isOpen={rideRequestModal.isOpen}
        onClose={handleRideRequestClose}
        onAccept={handleRideRequestClose}
        rideInfo={rideRequestModal.rideInfo || {}}
        ws={ws}
      />
    </>
  );
}

export default App;