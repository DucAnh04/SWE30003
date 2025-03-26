import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';

const SignIn = ({ show, onHide }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
    
        try {
            const response = await axios.post("http://localhost:8000/users/authenticate", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // Ensure it's sent as form data
                },
            });
    
            const { token } = response.data;
            localStorage.setItem("token", token); // Store JWT token
            
            alert("Login successful!");
            onHide();
            window.location.reload(); // Reload the page
        } catch (error) {
            console.error("Error:", error);
            alert(error.response?.data?.detail || "Authentication failed");
        }
    };
    

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Sign in to SmartRide</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Control 
                            type="text" 
                            placeholder="Email or phone number"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control 
                            type="password" 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 mb-3"
                    >
                        Sign in
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default SignIn;
