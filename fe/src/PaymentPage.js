import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup, Nav, Alert } from 'react-bootstrap';
import { Google, Apple, Facebook, CreditCard, InfoCircle, Check } from 'react-bootstrap-icons';
import axios from 'axios';
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [existingPayment, setExistingPayment] = useState(null);
  const [cardInfo, setCardInfo] = useState({
    nameOnCard: '',
    cardNumber: '',
    expirationDate: '',
    ccv: ''
  });

  const { id } = useParams();
  
  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8000/rides/${id}`)
      .then(response => {
        console.log('response', response.data);
        setRide(response.data);
        // Check if payment already exists for this ride
        axios.get(`http://localhost:8000/payments/${response.data.id}`)
          .then(paymentResponse => {
            console.log('Payment response:', paymentResponse.data);
            setExistingPayment(paymentResponse.data);
            
            // If payment status is 'Completed', notify user
            if (paymentResponse.data && paymentResponse.data.status === 'Completed') {
              setPaymentStatus({
                success: true,
                message: 'Payment has already been completed for this ride.',
                paymentId: paymentResponse.data.id
              });
            }
          })
          .catch(error => {
            console.error('Error fetching payment status:', error);
            // No payment exists or other error
            if (error.response && error.response.status === 404) {
              // No payment found is actually expected for a new payment flow
              console.log('No payment found for this ride yet');
            } else {
              setPaymentStatus({
                success: false,
                message: `Error checking payment status: ${error.response?.data?.detail || 'Unknown error'}`
              });
            }
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch(error => {
        console.error('Error fetching ride data:', error);
        setPaymentStatus({
          success: false,
          message: `Error fetching ride data: ${error.response?.data?.detail || 'Unknown error'}`
        });
        setLoading(false);
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardInfo({
      ...cardInfo,
      [name]: value
    });
  };

  const handlePaymentSubmit = () => {
    // Prevent payment if one is already completed
    if (existingPayment && existingPayment.status === 'Completed') {
      setPaymentStatus({
        success: true,
        message: 'Payment has already been completed for this ride.',
        paymentId: existingPayment.id
      });
      return;
    }
    
    setLoading(true);
    
    const token = localStorage.getItem('token');
    const userId = jwtDecode(token).user_id;

    // Simulate a transaction ID (in a real app, this would come from a payment processor)
    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create form data for the API call
    const formData = new FormData();
    formData.append('ride_id', id);
    formData.append('customer_id', ride?.userId || userId); // Use the userId from the decoded token as fallback
    formData.append('amount', 768); // Using the hardcoded amount from the UI
    formData.append('payment_method', paymentMethod);
    formData.append('transaction_id', transactionId);
    
    // Make the API call to create a payment
    axios.post('http://localhost:8000/payments/', formData)
      .then(response => {
        console.log('Payment successful:', response.data);
        setPaymentStatus({
          success: true,
          message: 'Payment processed successfully!',
          paymentId: response.data.payment_id
        });
        // Update the existing payment data
        setExistingPayment({
          ...response.data,
          status: 'Completed'
        });
      })
      .catch(error => {
        console.error('Payment failed:', error);
        setPaymentStatus({
          success: false,
          message: `Payment failed: ${error.response?.data?.detail || 'Unknown error'}`
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toTimeString().slice(0, 5); // Returns HH:MM
  };

  const timeDuration = (milliseconds) => {
    if (isNaN(milliseconds) || milliseconds < 0) return 'N/A';
  
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
  
    const formattedHours = hours > 0 ? `${hours}h ` : '';
    const formattedMinutes = minutes % 60 > 0 ? `${minutes % 60}m ` : '';
    const formattedSeconds = seconds % 60 > 0 ? `${seconds % 60}s` : '';
  
    return formattedHours + formattedMinutes + formattedSeconds || '0s';
  };
  
  const RideDuration = ({ ride }) => {
    if (!ride?.start_time || !ride?.end_time) return <small className="text-muted">N/A</small>;
    
    try {
      const duration = new Date(ride.end_time) - new Date(ride.start_time);
      return <small className="text-muted">{timeDuration(duration)}</small>;
    } catch (e) {
      return <small className="text-muted">N/A</small>;
    }
  };

  // Check if payment is already completed
  const isPaymentCompleted = existingPayment && existingPayment.status === 'Completed';
  
  return (
    <div className="min-vh-100 d-flex flex-column">

      {/* Main Content */}
      <Container className="py-4 flex-grow-1">
        {paymentStatus && (
          <Alert variant={paymentStatus.success ? 'success' : 'danger'} dismissible 
            onClose={() => setPaymentStatus(null)}>
            {paymentStatus.message}
          </Alert>
        )}
        
        <Row>
          <Col md={8}>
            <h4 className="mb-3 text-primary">Payment method</h4>
            {isPaymentCompleted ? (
              <Alert variant="success">
                <Alert.Heading>Payment Already Completed</Alert.Heading>
                <p>
                  This ride has already been paid for. Transaction ID: {existingPayment.transaction_id}
                </p>
              </Alert>
            ) : (
              <>
                <p className="text-muted mb-4">
                  Select a payment method below. SmartRide processes your payment securely with
                  end-to-end encryption.
                </p>

                {/* Payment Method Tabs */}
                <div className="mb-4">
                  <Row>
                    <Col xs={6} md={4} lg={3}>
                      <Button 
                        variant={paymentMethod === 'Credit Card' ? 'primary' : 'outline-secondary'}
                        className="w-100 py-2"
                        onClick={() => setPaymentMethod('Credit Card')}
                        disabled={isPaymentCompleted}
                      >
                        <CreditCard className="me-2" /> Credit card
                      </Button>
                    </Col>
                    <Col xs={6} md={4} lg={3}>
                      <Button 
                        variant={paymentMethod === 'Wallet' ? 'primary' : 'outline-secondary'}
                        className="w-100 py-2"
                        onClick={() => setPaymentMethod('Wallet')}
                        disabled={isPaymentCompleted}
                      >
                        PayPal
                      </Button>
                    </Col>
                  </Row>
                </div>

                {/* Credit Card Form */}
                {paymentMethod === 'Credit Card' && (
                  <div>
                    <h5 className="mb-3">Credit card details</h5>
                    <Form>
                      <Form.Check 
                        type="checkbox" 
                        id="same-address"
                        label="Billing address is same as Passenger 1"
                        checked={sameAsBilling}
                        onChange={() => setSameAsBilling(!sameAsBilling)}
                        className="mb-3"
                        disabled={isPaymentCompleted}
                      />
                      
                      <Form.Group className="mb-3">
                        <Form.Control 
                          type="text" 
                          placeholder="Name on card" 
                          name="nameOnCard"
                          value={cardInfo.nameOnCard}
                          onChange={handleInputChange}
                          disabled={isPaymentCompleted}
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Control 
                          type="text" 
                          placeholder="Card number" 
                          name="cardNumber"
                          value={cardInfo.cardNumber}
                          onChange={handleInputChange}
                          disabled={isPaymentCompleted}
                        />
                      </Form.Group>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Control 
                              type="text" 
                              placeholder="Expiration date" 
                              name="expirationDate"
                              value={cardInfo.expirationDate}
                              onChange={handleInputChange}
                              disabled={isPaymentCompleted}
                            />
                            <Form.Text className="text-muted">MM/YY</Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <InputGroup className="mb-3">
                            <Form.Control 
                              type="text" 
                              placeholder="CCV" 
                              name="ccv"
                              value={cardInfo.ccv}
                              onChange={handleInputChange}
                              disabled={isPaymentCompleted}
                            />
                            <Button variant="outline-secondary" disabled={isPaymentCompleted}>
                              <InfoCircle />
                            </Button>
                          </InputGroup>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                )}


                {/* Cancellation Policy */}
                <div className="mt-4 mb-4">
                  <h5>Cancellation policy</h5>
                  <p className="text-muted">
                    This ride has a flexible cancellation policy. If you cancel or change your flight up to 30 days 
                    before the departure date, you are eligible for a free refund. All rides booked on SmartRide are 
                    backed by our satisfaction guarantee, however cancellation policies vary by airline. See the full 
                    cancellation policy for this flight.
                  </p>
                  
                  <Button 
                    variant="outline-primary" 
                    className="mt-2"
                    onClick={handlePaymentSubmit}
                    disabled={loading || isPaymentCompleted}
                  >
                    {loading ? 'Processing...' : isPaymentCompleted ? 'Already Paid' : 'Confirm and pay'}
                  </Button>
                </div>
              </>
            )}
          </Col>

          {/* Order Summary */}
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded mb-4">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-light rounded-circle p-2 me-3">
                    <div className="bg-primary rounded-circle" style={{ width: '20px', height: '20px' }}></div>
                  </div>
                  <div>
                    <h5 className="m-0">{ride?.dropoff_location || 'N/A'}</h5>
                    <small className="text-muted">{ride?.vehicle || 'N/A'}</small>
                  </div>
                  <div className="ms-auto text-end">
                    <div>{ride?.created_at ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(ride.created_at)) : 'N/A'}</div>
                    <div>{formatTime(ride?.start_time) || 'N/A'} - {formatTime(ride?.end_time) || 'N/A'}</div>
                    <RideDuration ride={ride} />
                  </div>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span>Pickup location</span>
                  <span>{ride?.pickup_location || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Passengers</span>
                  <span>{ride?.passengers || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Status</span>
                  <span>{ride?.status || 'N/A'}</span>
                </div>
                {isPaymentCompleted && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Payment Status</span>
                    <span className="text-success">Completed</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <strong>Total</strong>
                  <strong>$768</strong>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant={isPaymentCompleted ? "success" : "primary"}
                    size="lg"
                    onClick={handlePaymentSubmit}
                    disabled={loading || isPaymentCompleted}
                  >
                    {loading ? 'Processing...' : isPaymentCompleted ? 'Payment Completed' : 'Confirm and pay'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

    </div>
  );
};

export default PaymentPage;