import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const SignIn = ({ show, onHide }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [dealAlerts, setDealAlerts] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add signup logic here
        console.log('Signup submitted', { email, password, agreeTerms, dealAlerts });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Sign in for SmartRide</Modal.Title>
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
                        disabled={!agreeTerms}
                    >
                        Sign in account
                    </Button>
                    
                    <div className="text-center mb-3">
                        <span className="text-muted">or</span>
                    </div>
                    
                    <div className="d-grid gap-2">
                        <Button
                            variant="outline-secondary"
                            className="w-100 d-flex align-items-center justify-content-center"
                            >
                            <i className="bi bi-google me-2" style={{ fontSize: '1.25rem' }}></i> {/* Use 'fontSize' for size */}
                            Continue with Google
                        </Button>
                        <Button 
                            variant="outline-secondary" 
                            className="w-100 d-flex align-items-center justify-content-center"
                        >
                            <i className="bi bi-apple me-2" style={{ fontSize: '1.25rem' }}></i> {/* Use 'fontSize' for size */}
                            Continue with Apple
                        </Button>
                        <Button 
                            variant="outline-secondary" 
                            className="w-100 d-flex align-items-center justify-content-center"
                        >
                            <i className="bi bi-facebook me-2" style={{ fontSize: '1.25rem' }}></i> {/* Use 'fontSize' for size */}
                            Continue with Facebook
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default SignIn;