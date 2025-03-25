import {React, useState} from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';

const Home = () => {
  const rideDeals = [
    {
      image: "/image/image-4.jpg",
      title: "The Bund, Shanghai",
      price: 599,
      description: "Iconic waterfront area with stunning city views"
    },
    {
      image: "/image/image-5.jpg",
      title: "Sydney Opera House, Sydney",
      price: 881,
      description: "UNESCO World Heritage site and architectural marvel"
    },
    {
      image: "/image/image-6.jpg",
      title: "Kinkaku Temple, Kyoto",
      price: 633,
      description: "Historic Zen temple with golden pavilion"
    }
  ];

  const featuredDestination = {
    image: "/image/image-7.jpg",
    title: "Tsavo East National Park, Kenya",
    price: 1246,
    description: "One of the oldest parks in Kenya, located in the semi-arid Taru Desert"
  };

  const uniqueStays = [
    {
      image: "/image/image-1.jpg",
      title: "Stay among the atolls in Maldives",
      description: "From the Srilankaa AO, the island's best leisure & exotic destination"
    },
    {
      image: "/image/image-2.jpg",
      title: "Experience the Darka Valley in Morocco",
      description: "Discover historic Moroccan architecture, colors, and traditions"
    },
    {
      image: "/image/image-3.jpg",
      title: "Live traditionally in Mongolia",
      description: "Traditional Mongolian yurts (gers) with authentic local experience"
    }
  ];

  const userReviews = [
    {
      name: "Yifei Chen",
      location: "Seoul, South Korea",
      date: "April 2019",
      rating: 5,
      review: "What a great experience using Tripma! I booked all of my flights for my trip through their platform and saved a lot on my travels. When I had to cancel a flight because of an emergency, Tripma support helped me."
    },
    {
      name: "Kenji Yamaguchi",
      location: "Hawaii",
      date: "February 2017",
      rating: 5,
      review: "My family and I visit Hawaii every year, and we usually book our flights using other websites. I recommend Tripma to us by a long time friend, and I'm as glad we tried it out! The process was easy and transparent."
    },
    {
      name: "Anthony Lewis",
      location: "Berlin, Germany",
      date: "April 2019",
      rating: 5,
      review: "When I was looking to book my flight to Berlin from LAX, Tripma had the best selection. The prices were competitive, and it gave a try. It was my first time using Tripma, but I'd definitely recommend it to a friend and use it for future travels."
    }
  ];

  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const airports = ['SFO', 'ATL', 'LAX', 'STL', 'PVG', 'MSP', 'NRT'];

  return (
    <Container fluid className="py-4">
      
      <div className="container-fluid vh-100 d-flex flex-column justify-content-center align-items-center" 
               style={{
                backgroundImage: "url('/banner.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              >
      <div className="text-center mb-4">
        <h1 className="display-4" style={{color: '#4a5fff'}}>
          It's more than<br/>just a trip
        </h1>
      </div>
      
      <div className="card shadow-lg" style={{width: '600px'}}>
        <div className="card-body p-4">
          <form>
            <div className="row g-3">
              <div className="col-md-6 position-relative">
                <div className="form-floating">
                  <input 
                    type="text" 
                    className="form-control" 
                    id="fromLocation"
                    placeholder="From where?"
                    value={fromLocation}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                    onChange={(e) => setFromLocation(e.target.value)}
                  />
                  <label htmlFor="fromLocation">From where?</label>
                  
                  {dropdownOpen && (
                    <ul className="list-group position-absolute w-100 mt-1 shadow-sm" style={{zIndex: 1000}}>
                      {airports
                        .filter(airport => 
                          airport.toLowerCase().includes(fromLocation.toLowerCase())
                        )
                        .map((airport) => (
                          <li 
                            key={airport} 
                            className="list-group-item list-group-item-action"
                            onMouseDown={() => {
                              setFromLocation(airport);
                              setDropdownOpen(false);
                            }}
                          >
                            {airport}
                          </li>
                        ))
                      }
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-floating">
                  <input 
                    type="text" 
                    className="form-control" 
                    id="toLocation"
                    placeholder="Where to?"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                  />
                  <label htmlFor="toLocation">Where to?</label>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-floating">
                  <input 
                    type="text" 
                    className="form-control" 
                    id="dates"
                    placeholder="Depart - Return"
                  />
                  <label htmlFor="dates">Depart - Return</label>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-floating">
                  <input 
                    type="text" 
                    className="form-control" 
                    id="passengers"
                    placeholder="1 adult"
                    defaultValue="1 adult"
                  />
                  <label htmlFor="passengers">Passengers</label>
                </div>
              </div>
              
              <div className="col-12">
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-3"
                  style={{backgroundColor: '#4a5fff', borderColor: '#4a5fff'}}
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
      {/* Ride Deals Section */}
      <Container>
        <h2 className="mb-3 mt-3">Find your next adventure with these rides deals</h2>
        <Row>
          {rideDeals.map((deal, index) => (
            <Col key={index} md={4} className="mb-3">
              <Card>
                <Card.Img variant="top" src={deal.image} />
                <Card.Body>
                  <Card.Title>{deal.title}</Card.Title>
                  <Card.Text>{deal.description}</Card.Text>
                  <Button variant="primary">${deal.price}</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Featured Destination */}
      <Container className="my-4">
        <Card>
          <Card.Img variant="top" src={featuredDestination.image} />
          <Card.Body>
            <Card.Title>{featuredDestination.title}</Card.Title>
            <Card.Text>{featuredDestination.description}</Card.Text>
            <Button variant="primary">${featuredDestination.price}</Button>
          </Card.Body>
        </Card>
      </Container>

      {/* Unique Places to Stay */}
      <Container>
        <h2 className="mb-3">Explore unique places to stay</h2>
        <Row>
          {uniqueStays.map((stay, index) => (
            <Col key={index} md={4} className="mb-3">
              <Card>
                <Card.Img variant="top" src={stay.image} />
                <Card.Body>
                  <Card.Title>{stay.title}</Card.Title>
                  <Card.Text>{stay.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <div className="text-center mt-3">
          <Button variant="primary">Explore more stays</Button>
        </div>
      </Container>

      {/* User Reviews Section */}
      <Container className="my-4">
        <h2 className="mb-3">What Tripma users are saying</h2>
        <Row>
          {userReviews.map((review, index) => (
            <Col key={index} md={4} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{review.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {review.location} | {review.date}
                  </Card.Subtitle>
                  <Card.Text>{review.review}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
};

export default Home;