import { Container, Row, Col, Nav } from 'react-bootstrap';

const Footer = () => {
    return (
      <footer className="bg-light pt-5 pb-3 mt-5">
      <Container>
        <Row className="mb-5">
          <Col md={3} className="mb-4">
            <h3 className="text-primary mb-4">SmartRide</h3>
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
    );
};

export default Footer;