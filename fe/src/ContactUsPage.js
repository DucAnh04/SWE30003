import React, { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    findUs: "",
    feedback: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.post(`http://localhost:8000/feedbacks`, formData);
      setMessage({ text: "Feedback submitted successfully!", type: "success" });
      setFormData({ name: "", email: "", phoneNumber: "", findUs: "", feedback: "" });
    } catch (error) {
      setMessage({ text: "Failed to submit feedback. Please try again.", type: "danger" });
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
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

            {message.text && (
              <Alert variant={message.type} className="text-center">
                {message.text}
              </Alert>
            )}

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
                  as="textarea"
                  name="feedback"
                  placeholder="Enter feedback here *"
                  value={formData.feedback}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button variant="danger" type="submit" className="w-100 py-2">
                SEND
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ContactForm;
