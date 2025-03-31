import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Pagination, Image, Nav, Button, Spinner } from 'react-bootstrap';
import randomImage1 from './components/images/user1.png';
import randomImage2 from './components/images/user2.png';
import randomImage3 from './components/images/user3.png';
import randomImage4 from './components/images/user4.png';
import randomImage5 from './components/images/user5.png';

const randomImages = [randomImage1, randomImage2, randomImage3, randomImage4, randomImage5];

const TestimonialCard = ({ name, location, date, review, rating, userImage }) => {
  const renderStars = (count) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`${index < count ? 'text-warning' : 'text-muted'}`}>
        ★
      </span>
    ));
  };

  const isLongReview = review && review.length > 150;
  const displayReview = isLongReview ? `${review.substring(0, 150)}...` : review;
  const selectedImage = userImage || randomImages[Math.floor(Math.random() * randomImages.length)];

  return (
    <Card className="mb-4 border-0 shadow-sm h-100">
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <Image
            src={selectedImage} // Use provided image or fallback to placeholder
            roundedCircle
            className="me-3"
            alt={`${name}'s profile`}
            style={{ width: '50px', height: '50px', objectFit: 'cover' }} // Ensure consistent image size
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
          {displayReview}
          {isLongReview && (
            <Button variant="link" className="text-decoration-none p-0 ms-1">
              read more...
            </Button>
          )}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  
  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/feedbacks/all-feedback?page=${currentPage}&limit=6`, {
          headers: { 'Accept': 'application/json' } // Ensure JSON response
        });
  
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
  
        // Map the feedback data to the expected structure
        const mappedTestimonials = data.feedback.map((item) => ({
          id: item.id,
          name: item.name,
          location: item.find_us || "Unknown",
          date: item.date,
          review: item.review,
          rating: item.rating,
          userImage: item.profile_picture || null, // Add profile picture if available
        }));
  
        setTestimonials(mappedTestimonials);
        setTotalPages(data.pages || 1);
        setError(null);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Unable to load testimonials. Please check the API.');
        setTestimonials([]); // No fallback data
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTestimonials();
  }, [currentPage]);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    let items = [];
    const maxPages = 5; // Maximum number of page links to show
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1} 
      />
    );
    
    // Calculate the range of pages to show
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    // Recalculate startPage if necessary
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    // First page if not already included
    if (startPage > 1) {
      items.push(
        <Pagination.Item 
          key={1} 
          onClick={() => handlePageChange(1)}
        >
          {1}
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }
    
    // Pages
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    
    // Last page if not already included
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      items.push(
        <Pagination.Item 
          key={totalPages} 
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages} 
      />
    );
    
    return <Pagination>{items}</Pagination>;
  };

  return (
    <div>
      {/* Main Content */}
      <Container className="py-5">
        <Row className="mb-4">
          <Col className="text-center">
            <h2>Let us know how you think about our services:</h2>
            <p className="text-muted">Your feedback helps us improve and serve you better</p>
          </Col>
        </Row>

        <Row>
          <Col className="d-flex justify-content-between align-items-center mb-4">
            <h3>What SmartRide users are saying</h3>
            <Button 
              variant="outline-primary" 
              href="/contact"
              className="d-none d-md-block"
            >
              Share Your Experience
            </Button>
          </Col>
        </Row>

        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <div className="alert alert-warning">{error}</div>
        ) : (
          <Row>
            {testimonials.map((testimonial) => (
              <Col md={4} key={testimonial.id} className="mb-4">
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
        )}

        {/* Mobile only button */}
        <Row className="d-md-none mb-4">
          <Col className="text-center">
            <Button 
              variant="primary" 
              href="/contact"
              className="w-100"
            >
              Share Your Experience
            </Button>
          </Col>
        </Row>

        {/* Pagination */}
        <Row className="justify-content-center mt-4">
          <Col md={6} className="d-flex justify-content-center">
            {renderPagination()}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TestimonialsPage;