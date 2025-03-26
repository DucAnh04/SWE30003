import React from 'react';
import { Container, Row, Col, Card, Pagination, Image, Nav, Button } from 'react-bootstrap';
import user1 from './components/images/user1.png';
import user2 from './components/images/user2.png';
import user3 from './components/images/user3.png';


const TestimonialCard = ({ name, location, date, review, rating, userImage }) => {
  const renderStars = (count) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`text-warning ${index < count ? 'text-warning' : 'text-muted'}`}>
        ★
      </span>
    ));
  };

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <Image 
            src={userImage || "/api/placeholder/50/50"}  // Use provided image or fallback to placeholder
            roundedCircle 
            className="me-3" 
            alt={`${name}'s profile`} 
            style={{width: '50px', height: '50px', objectFit: 'cover'}}  // Ensure consistent image size
          />
          <div>
            <h5 className="mb-0">{name}</h5>
            <p className="text-muted mb-0">
              {location} | {date}
            </p>
            <div>{renderStars(rating)}</div>
          </div>
        </div>
        <Card.Text>
          {review}
          <a href="#" className="text-primary ms-2">read more...</a>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

const TestimonialsPage = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Yifei Chen',
      location: 'Seoul, South Korea',
      date: 'April 2019',
      rating: 5,
      userImage: user1,  // Direct path to image in public folder
      review: 'What a great experience using SmartRide! I booked all of my flights for my gap year through SmartRide and never had any issues. When I had to cancel a flight because of an emergency, SmartRide support helped me.'
    },
    {
      id: 2,
      name: 'Kaori Yamaguchi',
      location: 'Honolulu, Hawaii',
      date: 'February 2017',
      rating: 4,
      userImage: user2,  // Direct path to image in public folder
      review: 'My family and I visit Hawaii every year, and we usually book our rides using other services. SmartRide was recommend to us by a long time friend, and I\'m so glad we tried it out! The process was easy and'
    },
    {
      id: 3,
      name: 'Anthony Lewis',
      location: 'Berlin, Germany',
      date: 'April 2019',
      rating: 5,
      userImage: user3,  // Direct path to image in public folder
      review: 'When I was looking to book my ride to Berlin from LAX, SmartRide had the best browsing experience so I figured I\'d give it a try. It was my first time using SmartRide, but I\'d definitely recommend it to a friend and use it for'
    }
  ];

  return (
    <div>
      
      {/* Main Content */}
      <Container className="py-5">
        <Row className="mb-4">
          <Col className="text-center">
            <h2>Let us know how you think about our services:</h2>
          </Col>
        </Row>

        <Row>
          <Col>
            <h3 className="mb-4">What SmartRide users are saying</h3>
          </Col>
        </Row>

        <Row>
          {testimonials.map((testimonial) => (
            <Col md={4} key={testimonial.id}>
              <TestimonialCard 
                name={testimonial.name}
                location={testimonial.location}
                date={testimonial.date}
                rating={testimonial.rating}
                userImage={testimonial.userImage}
                review={testimonial.review}
              />
            </Col>
          ))}
        </Row>

        {/* Pagination */}
        <Row className="justify-content-center mt-4">
          <Col md={6} className="d-flex justify-content-center">
            <Pagination>
              <Pagination.First />
              <Pagination.Prev />
              <Pagination.Item active>{1}</Pagination.Item>
              <Pagination.Item>{2}</Pagination.Item>
              <Pagination.Item>{3}</Pagination.Item>
              <Pagination.Ellipsis />
              <Pagination.Item>{67}</Pagination.Item>
              <Pagination.Item>{68}</Pagination.Item>
              <Pagination.Next />
              <Pagination.Last />
            </Pagination>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TestimonialsPage;