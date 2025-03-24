import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup, Nav, Alert } from 'react-bootstrap';
import { Google, Apple, Facebook, CreditCard, InfoCircle, Check } from 'react-bootstrap-icons';

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [sameAsBilling, setSameAsBilling] = useState(true);

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Navigation */}
      <header className="border-bottom py-3">
        <Container>
          <Row className="align-items-center">
            <Col>
              <h2 className="text-primary m-0">Tripma</h2>
            </Col>
            <Col xs="auto">
              <Nav className="ml-auto">
                <Nav.Link href="#" className="px-3">Rides</Nav.Link>
                <Nav.Link href="#" className="px-3">About Us</Nav.Link>
                <Nav.Link href="#" className="px-3">Packages</Nav.Link>
                <Nav.Link href="#" className="px-3">Sign in</Nav.Link>
                <Button variant="primary" className="ms-2">Sign up</Button>
              </Nav>
            </Col>
          </Row>
        </Container>
      </header>

      {/* Main Content */}
      <Container className="py-4 flex-grow-1">
        <Row>
          <Col md={8}>
            <h4 className="mb-3 text-primary">Payment method</h4>
            <p className="text-muted mb-4">
              Select a payment method below. SmartRide processes your payment securely with
              end-to-end encryption.
            </p>

            {/* Payment Method Tabs */}
            <div className="mb-4">
              <Row>
                <Col xs={6} md={4} lg={3}>
                  <Button 
                    variant={paymentMethod === 'credit' ? 'primary' : 'outline-secondary'}
                    className="w-100 py-2"
                    onClick={() => setPaymentMethod('credit')}
                  >
                    <CreditCard className="me-2" /> Credit card
                  </Button>
                </Col>
                <Col xs={6} md={4} lg={3}>
                  <Button 
                    variant={paymentMethod === 'paypal' ? 'primary' : 'outline-secondary'}
                    className="w-100 py-2"
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    PayPal
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Credit Card Form */}
            {paymentMethod === 'credit' && (
              <div>
                <h5 className="mb-3">Credit card details</h5>
                <Form>
                  <Form.Check 
                    type="checkbox" 
                    id="same-address"
                    label="Billing address is same as Passenger 1"
                    checked={sameAsBilling}
                    onChange={() => setSameAsBilling(!sameAsBilling)}
                    className="mb-3"
                  />
                  
                  <Form.Group className="mb-3">
                    <Form.Control type="text" placeholder="Name on card" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Control type="text" placeholder="Card number" />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Control type="text" placeholder="Expiration date" />
                        <Form.Text className="text-muted">MM/YY</Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <InputGroup className="mb-3">
                        <Form.Control type="text" placeholder="CCV" />
                        <Button variant="outline-secondary">
                          <InfoCircle />
                        </Button>
                      </InputGroup>
                    </Col>
                  </Row>
                </Form>
              </div>
            )}

            {/* Create Account Section */}
            <div className="mt-5">
              <h5 className="mb-3">Create an account</h5>
              <p className="text-muted mb-3">
                SmartRide is free to use as a guest, but if you create an account today, you can save and view
                rides, manage your trips, earn rewards, and more.
              </p>
              
              <Form.Check 
                type="checkbox" 
                id="save-card"
                label="Save card and create account for later"
                className="mb-3"
              />
              
              <Form.Group className="mb-3">
                <Form.Control type="email" placeholder="Email address or phone number" />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Control type="password" placeholder="Password" />
              </Form.Group>
              
              <div className="text-center mt-4 mb-4 position-relative">
                <hr />
                <span className="position-absolute top-0 start-50 translate-middle bg-white px-3 text-muted">
                  or
                </span>
              </div>
              
              <Button variant="outline-secondary" className="w-100 mb-2">
                <Google className="me-2" /> Sign up with Google
              </Button>
              
              <Button variant="outline-secondary" className="w-100 mb-2">
                <Apple className="me-2" /> Continue with Apple
              </Button>
              
              <Button variant="outline-secondary" className="w-100 mb-4">
                <Facebook className="me-2" /> Continue with Facebook
              </Button>
            </div>

            {/* Cancellation Policy */}
            <div className="mt-4 mb-4">
              <h5>Cancellation policy</h5>
              <p className="text-muted">
                This ride has a flexible cancellation policy. If you cancel or change your flight up to 30 days 
                before the departure date, you are eligible for a free refund. All rides booked on SmartRide are 
                backed by our satisfaction guarantee, however cancellation policies vary by airline. See the full 
                cancellation policy for this flight.
              </p>
              
              <Button variant="outline-primary" className="mt-2">
                Confirm and pay
              </Button>
            </div>
          </Col>

          {/* Order Summary */}
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded mb-4">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-light rounded-circle p-2 me-3">
                    <div className="bg-primary rounded-circle" style={{ width: '20px', height: '20px' }}></div>
                  </div>
                  <div>
                    <h5 className="m-0">London</h5>
                    <small className="text-muted">FIG4312</small>
                  </div>
                  <div className="ms-auto text-end">
                    <div>16h 45m (+1d)</div>
                    <div>7:00 AM - 4:15 PM</div>
                    <small className="text-muted">2h 45m in HNL</small>
                  </div>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span>Seat upgrade</span>
                  <span>$199</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>$702</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Taxes and Fees</span>
                  <span>$66</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <strong>Total</strong>
                  <strong>$768</strong>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <Button variant="primary" size="lg">
                    Confirm and pay
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-light pt-5 pb-3 mt-5">
        <Container>
          <Row className="mb-5">
            <Col md={3} className="mb-4">
              <h3 className="text-primary mb-4">Tripma</h3>
            </Col>
            <Col md={3} className="mb-4">
              <h6 className="text-dark mb-3">About</h6>
              <Nav className="flex-column">
                <Nav.Link href="#" className="text-muted p-0 mb-2">About SmartRide</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">How it works</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Careers</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Press</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Blog</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0">Forum</Nav.Link>
              </Nav>
            </Col>
            <Col md={3} className="mb-4">
              <h6 className="text-dark mb-3">Partner with us</h6>
              <Nav className="flex-column">
                <Nav.Link href="#" className="text-muted p-0 mb-2">Partnership programs</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Affiliate program</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Connectivity partners</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Promotions and events</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Integrations</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Community</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0">Loyalty program</Nav.Link>
              </Nav>
            </Col>
            <Col md={3} className="mb-4">
              <h6 className="text-dark mb-3">Support</h6>
              <Nav className="flex-column">
                <Nav.Link href="#" className="text-muted p-0 mb-2">Help Center</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Contact us</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Privacy policy</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Terms of service</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Trust and safety</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0">Accessibility</Nav.Link>
              </Nav>
            </Col>
            <Col md={3} className="mb-4">
              <h6 className="text-dark mb-3">Get the app</h6>
              <Nav className="flex-column">
                <Nav.Link href="#" className="text-muted p-0 mb-2">Tripma for Android</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-2">Tripma for iOS</Nav.Link>
                <Nav.Link href="#" className="text-muted p-0 mb-3">Mobile site</Nav.Link>
                <div className="mb-2">
                  <img src="/api/placeholder/140/42" alt="App Store" className="img-fluid mb-2" />
                </div>
                <div>
                  <img src="/api/placeholder/140/42" alt="Google Play" className="img-fluid" />
                </div>
              </Nav>
            </Col>
          </Row>
          <Row className="pt-4 border-top">
            <Col md={6}>
              <div className="d-flex">
                <a href="#" className="me-3 text-muted">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="me-3 text-muted">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="#" className="text-muted">
                  <i className="bi bi-facebook"></i>
                </a>
              </div>
            </Col>
            <Col md={6} className="text-md-end">
              <small className="text-muted">© 2025 SmartRide incorporated</small>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default PaymentPage;