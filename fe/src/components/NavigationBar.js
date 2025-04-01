import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import { jwtDecode } from "jwt-decode";


const NavigationBar = () => {
    
    const [showSignup, setShowSignup] = useState(false);
    const [showSignin, setShowSignin] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded); // Set the decoded user data
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem("token"); // Remove if invalid
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <>
            <header className="border-bottom py-3">
                <Container>
                    <Row className="align-items-center">
                        <Col>
                            <h2 className="text-primary m-0">
                              <a href="/" className="text-decoration-none"> 
                              SmartRide
                              </a>
                            </h2>
                        </Col>
                        <Col xs="auto">
                            <Nav className="ml-auto">
                                <Nav.Link href="/ride" className="px-3">Recent ride</Nav.Link>
                                <Nav.Link href="/contact" className="px-3">Contact</Nav.Link>
                                <Nav.Link href="/payment" className="px-3">Payment</Nav.Link>
                                <Nav.Link href="/feedback" className="px-3">Feedback</Nav.Link>
                                <Nav.Link href="/admin" className="px-3">Admin</Nav.Link>


                                {user ? (
                                    <>
                                        <Button 
                                            className="ms-2"
                                            onClick={() => navigate("/profile")}
                                        >
                                            Welcome, {user.name}
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            className="ms-2"
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Nav.Link 
                                            variant="primary" 
                                            className="ms-2"
                                            onClick={() => setShowSignin(true)}
                                        >
                                            Sign in
                                        </Nav.Link>
                                        <Button 
                                            variant="primary" 
                                            className="ms-2"
                                            onClick={() => setShowSignup(true)}
                                        >
                                            Sign up
                                        </Button>
                                    </>
                                )}
                            </Nav>
                        </Col>
                    </Row>
                </Container>
            </header>

            {showSignup && <SignUp show={showSignup} onHide={() => setShowSignup(false)} />}
            {showSignin && <SignIn show={showSignin} onHide={() => setShowSignin(false)} />}
        </>
    );
};

export default NavigationBar;
