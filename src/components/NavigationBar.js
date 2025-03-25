import React, { useState } from 'react';
import { Container, Row, Col, Button, Nav } from 'react-bootstrap';
import SignUp from './SignUp';
import SignIn from './SignIn';

const NavigationBar = () => {
    const [showSignup, setShowSignup] = useState(false);
    const [showSignin, setShowSignin] = useState(false);

    return (
      <>
        <header className="border-bottom py-3">
          <Container>
            <Row className="align-items-center">
              <Col>
                <h2 className="text-primary m-0">SmartRide</h2>
              </Col>
              <Col xs="auto">
                <Nav className="ml-auto">
                  <Nav.Link href="#" className="px-3">Rides</Nav.Link>
                  <Nav.Link href="#" className="px-3">About Us</Nav.Link>
                  <Nav.Link href="#" className="px-3">Packages</Nav.Link>
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
                </Nav>
              </Col>
            </Row>
          </Container>
        </header>

        {showSignup && (
          <SignUp 
            show={showSignup} 
            onHide={() => setShowSignup(false)} 
          />
        )}

        {showSignin && (
          <SignIn 
            show={showSignin} 
            onHide={() => setShowSignin(false)} 
          />
        )}
      </>
    );
}

export default NavigationBar;