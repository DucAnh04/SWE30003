import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const RideRequestModal = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  rideInfo,
  ws
}) => {
    const handleResponse = (accepted) => {
        // Send response back through WebSocket
        if (ws) {
          ws.send(JSON.stringify({
            type: 'driverResponse',
            accepted: accepted,
            rideInfo: rideInfo
          }));
        }
    
        // Close the modal without sending again
        onClose(accepted, false);
    };

  return (
    <Modal show={isOpen} onHide={() => handleResponse(false)}>
      <Modal.Header closeButton>
        <Modal.Title>New Ride Request</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="ride-details">
          <p><strong>From:</strong> {rideInfo.from}</p>
          <p><strong>To:</strong> {rideInfo.to}</p>
          <p><strong>Vehicle Type:</strong> {rideInfo.vehicle}</p>
          <p><strong>Passengers:</strong> {rideInfo.passengers}</p>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleResponse(false)}>
          Deny
        </Button>
        <Button variant="primary" onClick={() => handleResponse(true)}>
          Accept
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RideRequestModal;