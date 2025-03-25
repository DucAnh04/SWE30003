import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const SignUp = ({ show, onHide }) => {
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
                        Create account
                    </Button>
                    
                    <div className="text-center mb-3">
                        <span className="text-muted">or</span>
                    </div>
                    
                    <div className="d-grid gap-2">
                        <Button 
                            variant="outline-secondary" 
                            className="w-100 d-flex align-items-center justify-content-center"
                        >
                            <img 
                                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PC9zdmc+" 
                                alt="Google logo" 
                                className="me-2" 
                                width="20" 
                                height="20"
                            />
                            Continue with Google
                        </Button>
                        <Button 
                            variant="outline-secondary" 
                            className="w-100 d-flex align-items-center justify-content-center"
                        >
                            <img 
                                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PC9zdmc+" 
                                alt="Apple logo" 
                                className="me-2" 
                                width="20" 
                                height="20"
                            />
                            Continue with Apple
                        </Button>
                        <Button 
                            variant="outline-secondary" 
                            className="w-100 d-flex align-items-center justify-content-center"
                        >
                            <img 
                                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PC9zdmc+" 
                                alt="Facebook logo" 
                                className="me-2" 
                                width="20" 
                                height="20"
                            />
                            Continue with Facebook
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default SignUp;