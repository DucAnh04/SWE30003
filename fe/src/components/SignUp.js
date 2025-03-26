import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const SignUp = ({ show, onHide }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('Customer');
    const [profilePicture, setProfilePicture] = useState(null);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [dealAlerts, setDealAlerts] = useState(false);

    const handleFileChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('user_type', userType);
        if (profilePicture) {
            formData.append('profile_picture', profilePicture);
        }
    
        try {
            const response = await axios.post("http://localhost:8000/users/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
    
            alert("User registered successfully!");
            onHide();
        } catch (error) {
            console.error("Error:", error);
            alert(error.response?.data?.detail || "Registration failed");
        }
    };
    

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Sign up for SmartRide</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted text-center mb-4">
                    SmartRide is totally free to use. Sign up using your email address or phone number below to get started.
                </p>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Control 
                            type="text" 
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
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
                    <Form.Group className="mb-3">
                        <Form.Select value={userType} onChange={(e) => setUserType(e.target.value)}>
                            <option value="Customer">Customer</option>
                            <option value="Driver">Driver</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Profile Picture</Form.Label>
                        <Form.Control 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Check 
                            type="checkbox"
                            id="terms"
                            label="I agree to the terms and conditions"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Check 
                            type="checkbox"
                            id="dealAlerts"
                            label="Send me the latest deal alerts"
                            checked={dealAlerts}
                            onChange={(e) => setDealAlerts(e.target.checked)}
                        />
                    </Form.Group>
                    
                    <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 mb-3"
                        disabled={!agreeTerms}
                    >
                        Sign up account
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default SignUp;