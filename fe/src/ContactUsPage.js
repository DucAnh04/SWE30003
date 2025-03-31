import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    findUs: '',
    rating: 0,
    feedback: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState({ success: false, message: '' });
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prevState => ({
      ...prevState,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);
    
    try {
      // Get token from localStorage if it exists
      const token = localStorage.getItem('userToken') || '';
      
      // Create FormData object for the API request (using FormData since the backend expects Form data)
      const submissionData = new FormData();
      submissionData.append('name', formData.name);
      submissionData.append('email', formData.email);
      submissionData.append('phone_number', formData.phoneNumber);
      submissionData.append('find_us', formData.findUs);
      submissionData.append('rating', formData.rating);
      submissionData.append('feedback_text', formData.feedback);
      
      if (token) {
        submissionData.append('user_token', token);
      }
      
      // Get the base API URL from environment variable or use default
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      // UPDATED: Use the correct endpoint path that matches the FastAPI router
      const response = await fetch(`${apiUrl}/feedbacks/submit`, {
        method: 'POST',
        body: submissionData,
      });
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      // Success
      setSubmitResult({
        success: true,
        message: 'Thank you for your feedback! We appreciate your input.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        findUs: '',
        rating: 0,
        feedback: ''
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitResult({
        success: false,
        message: 'Connection error. Please check if the API server is running and try again.'
      });
    } finally {
      setIsSubmitting(false);
      setShowAlert(true);
      
      // Auto hide alert after 5 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    }
  };

  // Rating star component
  const RatingStars = () => {
    return (
      <div className="rating-container mb-3">
        <Form.Label className="d-block mb-2">Rate your experience *</Form.Label>
        <div className="d-flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className="star-rating me-2"
              onClick={() => handleRatingChange(star)}
              style={{
                cursor: 'pointer',
                fontSize: '2rem',
                color: star <= formData.rating ? '#dc3545' : '#ccc'
              }}
            >
              ★
            </span>
          ))}
        </div>
        <Form.Text className="text-muted">
          {formData.rating > 0 ? `You selected ${formData.rating} star${formData.rating !== 1 ? 's' : ''}` : 'Please select a rating'}
        </Form.Text>
      </div>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      
      {/* Main Content */}
      <Container className="flex-grow-1 d-flex align-items-center justify-content-center my-5">
        <Row className="w-100 justify-content-center">
          <Col md={6} className="p-4 bg-white shadow rounded">
            {showAlert && (
              <Alert 
                variant={submitResult.success ? 'success' : 'danger'} 
                onClose={() => setShowAlert(false)} 
                dismissible
              >
                {submitResult.message}
              </Alert>
            )}
            
            <div className="text-center mb-4">
              <h1 className="mb-3">
                Get in <span className="text-danger">Touch</span>
              </h1>
              <p className="text-muted">
                We'd love to hear from you! Please share your experience with SmartRide.
              </p>
            </div>
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Control 
                  type="text" 
                  name="name" 
                  placeholder="Name *" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control 
                  type="email" 
                  name="email" 
                  placeholder="Email *" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control 
                  type="tel" 
                  name="phoneNumber" 
                  placeholder="Phone Number *" 
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required 
                />
              </Form.Group>
                
              <Form.Group className="mb-3">
                <Form.Control 
                  as="select"
                  name="findUs" 
                  value={formData.findUs}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">How did you find us? *</option>
                  <option value="Google">Google</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Referral">Referral</option>
                  <option value="Other">Other</option>
                </Form.Control>
              </Form.Group>

              {/* Rating Stars Component */}
              <RatingStars />

              <Form.Group className="mb-3">
                <Form.Control 
                  as="textarea"
                  name="feedback" 
                  placeholder="Enter feedback here *" 
                  value={formData.feedback}
                  onChange={handleChange}
                  required 
                  rows={4}
                />
              </Form.Group>

              <Button 
                variant="danger" 
                type="submit" 
                className="w-100 py-2"
                disabled={formData.rating === 0 || isSubmitting}
              >
                {isSubmitting ? 'SENDING...' : 'SEND'}
              </Button>
              {formData.rating === 0 && (
                <Form.Text className="text-danger d-block text-center mt-2">
                  Please provide a rating before submitting
                </Form.Text>
              )}
            </Form>

            <div className="contact-info mt-4 text-center">
              <div className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                +54 542 1234
              </div>
              <div className="mb-2">
                <i className="bi bi-printer me-2"></i>
                054 542 1234
              </div>
              <div>
                <i className="bi bi-envelope me-2"></i>
                info@smartride.com
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ContactForm;
