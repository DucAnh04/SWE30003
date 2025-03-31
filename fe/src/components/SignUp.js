import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

const SignUp = ({ show, onHide }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirm password
    const [userType, setUserType] = useState('Customer');
    const [profilePicture, setProfilePicture] = useState(null);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [dealAlerts, setDealAlerts] = useState(false);

    // New driver-specific state variables
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [driverLicensePicture, setDriverLicensePicture] = useState(null);

    // Validation state
    const [errors, setErrors] = useState({});

    const handleFileChange = (e, setFile) => {
        setFile(e.target.files[0]);
    };

    const validateInputs = () => {
        const newErrors = {};

        // Full Name validation
        if (!name.trim()) {
            newErrors.name = 'Full Name is required';
        } else if (name.trim().split(' ').length < 2) {
            newErrors.name = 'Please enter at least two words';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }

        // Confirm Password validation
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Driver-specific validations
        if (userType === 'Driver') {
            if (!vehicleNumber.trim()) {
                newErrors.vehicleNumber = 'Vehicle Number is required';
            }
            if (!vehicleType.trim()) {
                newErrors.vehicleType = 'Please select a Vehicle Type';
            }
            if (!licenseNumber.trim()) {
                newErrors.licenseNumber = 'Driver\'s License Number is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateInputs()) {
            return; // Stop submission if validation fails
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('user_type', userType);
        
        // Append profile picture if exists
        if (profilePicture) {
            formData.append('profile_picture', profilePicture);
        }

        // If driver, append additional driver-specific details
        if (userType === 'Driver') {
            formData.append('vehicle_number', vehicleNumber);
            formData.append('vehicle_type', vehicleType);
            formData.append('license_number', licenseNumber);
            
            if (driverLicensePicture) {
                formData.append('driver_license_picture', driverLicensePicture);
            }
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
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Sign up for SmartRide</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted text-center mb-4">
                    SmartRide is totally free to use. Sign up using your email address or phone number below to get started.
                </p>
                <Form onSubmit={handleSubmit}>
                    {/* Basic User Information */}
                    <Form.Group className="mb-3">
                        <Form.Control 
                            type="text" 
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control 
                            type="text" 
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control 
                            type="password" 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            isInvalid={!!errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.password}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control 
                            type="password" 
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            isInvalid={!!errors.confirmPassword}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                        </Form.Control.Feedback>
                    </Form.Group>
                    
                    {/* User Type Selection */}
                    <Form.Group className="mb-3">
                        <Form.Select value={userType} onChange={(e) => setUserType(e.target.value)}>
                            <option value="Customer">Customer</option>
                            <option value="Driver">Driver</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Profile Picture */}
                    <Form.Group className="mb-3">
                        <Form.Label>Profile Picture</Form.Label>
                        <Form.Control 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setProfilePicture)}
                        />
                    </Form.Group>

                    {/* Driver-Specific Fields (Conditionally Rendered) */}
                    {userType === 'Driver' && (
                        <>
                            <Alert variant="info" className="mb-3">
                                Please provide your vehicle and license details
                            </Alert>
                            
                            <Form.Group className="mb-3">
                                <Form.Control 
                                    type="text" 
                                    placeholder="Vehicle Number"
                                    value={vehicleNumber}
                                    onChange={(e) => setVehicleNumber(e.target.value)}
                                    isInvalid={!!errors.vehicleNumber}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.vehicleNumber}
                                </Form.Control.Feedback>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Select 
                                    value={vehicleType} 
                                    onChange={(e) => setVehicleType(e.target.value)}
                                    isInvalid={!!errors.vehicleType}
                                >
                                    <option value="">Select Vehicle Type</option>
                                    <option value="Sedan">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Hatchback">Hatchback</option>
                                    <option value="Luxury">Luxury</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.vehicleType}
                                </Form.Control.Feedback>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Control 
                                    type="text" 
                                    placeholder="Driver's License Number"
                                    value={licenseNumber}
                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                    isInvalid={!!errors.licenseNumber}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.licenseNumber}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </>
                    )}

                    {/* Terms and Alerts */}
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