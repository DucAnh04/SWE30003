import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
const SingleRideDetail = () => {
  // Initial ride data
  const [ride, setRide] = useState({
    id: 1,
    customer_id: 101,
    driver_id: 201,
    pickup_location: '123 Main St',
    dropoff_location: '456 Market St',
    status: 'Pending',
    rating: 'Neutral',
    fare: 25.50,
    start_time: '2024-03-28 10:30:00',
    end_time: null,
    vehicle: 'Toyota Camry',
    passengers: 2
  });

  useEffect(() => {
    // Fetch ride details from the backend
    const token = localStorage.getItem('token');
    if(!token){
      throw new Error('No token found');
    }
    console.log(token)
    axios.get(`http://localhost:8000/rides/recent/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setRide(response.data);
        console.log(response.data)
      })
      .catch(error => console.error('Error fetching ride details:', error));
  }, []);

  // State for status and rating modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Status options
  const statusOptions = ['Pending', 'Accepted', 'Ongoing', 'Completed', 'Cancelled'];

  // Rating options
  const ratingOptions = ['Bad', 'Neutral', 'Good'];

  // Update status handler
  const handleStatusUpdate = async (newStatus) => {
    setRide(prevRide => ({
      ...prevRide,
      status: newStatus,
      // Auto-update end time if completed
      end_time: newStatus === 'Completed' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : prevRide.end_time
    }));

    const formData = new FormData();
    formData.append("status", newStatus);
    formData.append("rating", ride.rating);

    const response = await axios.put(`http://localhost:8000/rides/${ride.ride_id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setShowStatusModal(false);
  };

  // Update rating handler
  const handleRatingUpdate = async (newRating) => {
    setRide(prevRide => ({
      ...prevRide,
      rating: newRating
    }));

    const formData = new FormData();
    formData.append("status", ride.status);
    formData.append("rating", newRating);

    const response = await axios.put(`http://localhost:8000/rides/${ride.ride_id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setShowRatingModal(false);
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header as="h2" className="d-flex justify-content-between align-items-center">
          Ride Details
          <span className="badge bg-primary">Most recent ride:</span>
        </Card.Header>
        <Card.Body>
          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Pickup Location:</strong> {ride.pickup_location}
            </div>
            <div className="col-md-6">
              <strong>Dropoff Location:</strong> {ride.dropoff_location}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <strong>Status:</strong>{' '}
              <span className={`badge bg-${
                ride.status === 'Completed' ? 'success' :
                ride.status === 'Ongoing' ? 'primary' :
                ride.status === 'Pending' ? 'warning' :
                ride.status === 'Cancelled' ? 'danger' : 'secondary'
              }`}>
                {ride.status}
              </span>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="ml-2"
                onClick={() => setShowStatusModal(true)}
              >
                Update Status
              </Button>
            </div>
            <div className="col-md-4">
              <strong>Rating:</strong>{' '}
              <span className={`badge bg-${
                ride.rating === 'Good' ? 'success' :
                ride.rating === 'Neutral' ? 'warning' :
                'danger'
              }`}>
                {ride.rating}
              </span>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="ml-2"
                onClick={() => setShowRatingModal(true)}
              >
                Update Rating
              </Button>
            </div>
            <div className="col-md-4">
              <strong>Fare:</strong> ${ride.fare ? ride.fare.toFixed(2) : 'N/A'}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <strong>Vehicle:</strong> {ride.vehicle}
            </div>
            <div className="col-md-4">
              <strong>Passengers:</strong> {ride.passengers}
            </div>
            <div className="col-md-4">
              <strong>Start Time:</strong> {ride.start_time ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(ride.start_time)) : 'Not yet finish'}
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <strong>Customer:</strong> {ride.customer_name || 'N/A'}
            </div>
            <div className="col-md-4">
              <strong>Driver:</strong> {ride.driver_name || 'Not Assigned'}
            </div>

            <div className="col-md-4">
              <strong>End Time:</strong> {ride.end_time ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(ride.end_time)) : 'Not yet finish'}
            </div>

          </div>



        </Card.Body>
      </Card>

      <Button className='mt-3' variant='primary' onClick={() => window.location.pathname = '/payment'}>Process payment</Button>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Ride Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {statusOptions.filter(status => !['Cancelled', 'Completed'].includes(ride.status)).map((status) => (
            <Button 
              key={status} 
              variant="outline-primary" 
              className="m-1"
              onClick={() => handleStatusUpdate(status)}
            >
              {status}
            </Button>
          ))}
        </Modal.Body>
      </Modal>

      {/* Rating Update Modal */}
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Ride Rating</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ratingOptions.map((rating) => (
            <Button 
              key={rating} 
              variant="outline-primary" 
              className="m-1"
              onClick={() => handleRatingUpdate(rating)}
            >
              {rating}
            </Button>
          ))}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SingleRideDetail;