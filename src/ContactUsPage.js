import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Nav } from 'react-bootstrap';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    findUs: '',
    feedback: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      
      {/* Main Content */}
      <Container className="flex-grow-1 d-flex align-items-center justify-content-center my-5">
        <Row className="w-100 justify-content-center">
          <Col md={6} className="p-4 bg-white shadow rounded">
            <div className="text-center mb-4">
              <h1 className="mb-3">
                Get in <span className="text-danger">Touch</span>
              </h1>
              <p className="text-muted">
                Enim tempor eget pharetra facilisis sed maecenas adipiscing. 
                Eu leo molestie vel, ornare non id blandit netus.
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
                  <option value="google">Google</option>
                  <option value="social">Social Media</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control 
                  as="textarea"
                  name="feedback" 
                  placeholder="Enter feedback here *" 
                  value={formData.feedback}
                  onChange={handleChange}
                  required 
                />
              </Form.Group>

              <Button 
                variant="danger" 
                type="submit" 
                className="w-100 py-2"
              >
                SEND
              </Button>
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
                info@marcc.com.au
              </div>
            </div>
          </Col>
        </Row>
      </Container>


    </div>
  );
};

export default ContactForm;