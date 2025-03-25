import { Container, Row, Col, Button, Nav } from 'react-bootstrap';

const NavigationBar = () => {
    return (
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
                <Nav.Link href="#" className="px-3">Sign in</Nav.Link>
                <Button variant="primary" className="ms-2">Sign up</Button>
              </Nav>
            </Col>
          </Row>
        </Container>
      </header>
    );
}

export default NavigationBar;
