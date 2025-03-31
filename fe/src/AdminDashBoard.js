    // App.js - Main Component
    import React, { useState, useEffect } from 'react';
    import { Container, Row, Col, Nav, Navbar, Card, Table, Badge, Button, Form, Modal, Tabs, Tab } from 'react-bootstrap';
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { faUsers, faCarSide, faHistory, faComments, faDollarSign, faTachometerAlt, faSignOutAlt, faUserPlus, faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
    import 'bootstrap/dist/css/bootstrap.min.css';
    import './styles.css';

    const AdminDashboard = () => {
    // State for users and rides
    const [users, setUsers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [rides, setRides] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRideDetailsModal, setShowRideDetailsModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentRide, setCurrentRide] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredRides, setFilteredRides] = useState([]);
    const [rideFilter, setRideFilter] = useState('all');

    // Fetch data from API (mock data for now)
    useEffect(() => {
        // Mock data based on your DB schema
        const mockUsers = [
        { id: 1, name: 'John Admin', email: 'admin@example.com', user_type: 'Admin', created_at: '2025-01-15' },
        { id: 2, name: 'Sarah Driver', email: 'driver@example.com', user_type: 'Driver', created_at: '2025-01-20' },
        { id: 3, name: 'Mike Customer', email: 'customer@example.com', user_type: 'Customer', created_at: '2025-02-05' },
        { id: 4, name: 'Lisa Driver', email: 'lisa@example.com', user_type: 'Driver', created_at: '2025-02-10' },
        { id: 5, name: 'Tom Customer', email: 'tom@example.com', user_type: 'Customer', created_at: '2025-03-01' }
        ];

        const mockDrivers = [
        { id: 2, vehicle_number: 'ABC123', vehicle_type: 'Sedan', license_number: 'DL12345', status: 'Available' },
        { id: 4, vehicle_number: 'XYZ789', vehicle_type: 'SUV', license_number: 'DL67890', status: 'On Ride' }
        ];

        const mockRides = [
        { id: 1, customer_id: 3, driver_id: 2, pickup_location: '123 Main St', dropoff_location: '456 Oak Ave', status: 'Completed', rating: 'Good', fare: 25.50, start_time: '2025-03-15 14:30:00', end_time: '2025-03-15 15:15:00', vehicle: 'Sedan', passengers: 1, created_at: '2025-03-15 14:25:00', customer_name: 'Mike Customer', driver_name: 'Sarah Driver' },
        { id: 2, customer_id: 5, driver_id: 4, pickup_location: '789 Pine Rd', dropoff_location: '321 Maple Dr', status: 'Ongoing', rating: 'Neutral', fare: 18.75, start_time: '2025-03-30 09:45:00', end_time: null, vehicle: 'SUV', passengers: 2, created_at: '2025-03-30 09:40:00', customer_name: 'Tom Customer', driver_name: 'Lisa Driver' },
        { id: 3, customer_id: 3, driver_id: null, pickup_location: '555 Beach Blvd', dropoff_location: '777 Park Ave', status: 'Pending', rating: 'Neutral', fare: null, start_time: null, end_time: null, vehicle: null, passengers: 1, created_at: '2025-03-31 08:15:00', customer_name: 'Mike Customer', driver_name: null }
        ];

        setUsers(mockUsers);
        setDrivers(mockDrivers);
        setRides(mockRides);
        setFilteredUsers(mockUsers);
        setFilteredRides(mockRides);
    }, []);

    // Filter users based on search term
    useEffect(() => {
        const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_type.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    // Filter rides
    useEffect(() => {
        let filtered = rides;
        
        if (rideFilter !== 'all') {
        filtered = rides.filter(ride => ride.status.toLowerCase() === rideFilter.toLowerCase());
        }
        
        if (searchTerm) {
        filtered = filtered.filter(ride => 
            (ride.customer_name && ride.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (ride.driver_name && ride.driver_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ride.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ride.dropoff_location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        }
        
        setFilteredRides(filtered);
    }, [searchTerm, rides, rideFilter]);

    // Handle view user details
    const handleViewUser = (user) => {
        setCurrentUser(user);
        setShowUserModal(true);
    };

    // Handle view ride details
    const handleViewRide = (ride) => {
        setCurrentRide(ride);
        setShowRideDetailsModal(true);
    };

    // Dashboard statistics
    const totalUsers = users.length;
    const totalDrivers = drivers.length;
    const totalCustomers = users.filter(user => user.user_type === 'Customer').length;
    const totalRides = rides.length;
    const completedRides = rides.filter(ride => ride.status === 'Completed').length;
    const pendingRides = rides.filter(ride => ride.status === 'Pending').length;
    const ongoingRides = rides.filter(ride => ride.status === 'Ongoing').length;

    // Status badge color
    const getStatusBadgeColor = (status) => {
        switch(status) {
        case 'Completed': return 'success';
        case 'Ongoing': return 'primary';
        case 'Pending': return 'warning';
        case 'Cancelled': return 'danger';
        case 'Accepted': return 'info';
        default: return 'secondary';
        }
    };

    // User type badge color
    const getUserTypeBadgeColor = (userType) => {
        switch(userType) {
        case 'Admin': return 'danger';
        case 'Driver': return 'info';
        case 'Customer': return 'success';
        default: return 'secondary';
        }
    };

    // Driver status badge color
    const getDriverStatusBadgeColor = (status) => {
        switch(status) {
        case 'Available': return 'success';
        case 'On Ride': return 'primary';
        case 'Offline': return 'secondary';
        default: return 'secondary';
        }
    };

    return (
        <div className="admin-dashboard">
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
            <Container fluid>
            <Navbar.Brand href="#home">
                <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                Ride Share Admin
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ms-auto">
                <Nav.Link href="#logout">
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-1" /> Logout
                </Nav.Link>
                </Nav>
            </Navbar.Collapse>
            </Container>
        </Navbar>

        <Container fluid>
            <Row>
            <Col md={2} className="sidebar bg-dark p-0">
                <Nav className="flex-column p-3">
                <Nav.Link 
                    className={activeTab === 'dashboard' ? 'active' : ''} 
                    onClick={() => setActiveTab('dashboard')}
                >
                    <FontAwesomeIcon icon={faTachometerAlt} className="me-2" /> Dashboard
                </Nav.Link>
                <Nav.Link 
                    className={activeTab === 'users' ? 'active' : ''} 
                    onClick={() => setActiveTab('users')}
                >
                    <FontAwesomeIcon icon={faUsers} className="me-2" /> User Management
                </Nav.Link>
                <Nav.Link 
                    className={activeTab === 'rides' ? 'active' : ''} 
                    onClick={() => setActiveTab('rides')}
                >
                    <FontAwesomeIcon icon={faHistory} className="me-2" /> Ride History
                </Nav.Link>
                <Nav.Link 
                    className={activeTab === 'drivers' ? 'active' : ''} 
                    onClick={() => setActiveTab('drivers')}
                >
                    <FontAwesomeIcon icon={faCarSide} className="me-2" /> Driver Management
                </Nav.Link>
                <Nav.Link 
                    className={activeTab === 'payments' ? 'active' : ''} 
                    onClick={() => setActiveTab('payments')}
                >
                    <FontAwesomeIcon icon={faDollarSign} className="me-2" /> Payments
                </Nav.Link>
                <Nav.Link 
                    className={activeTab === 'feedback' ? 'active' : ''} 
                    onClick={() => setActiveTab('feedback')}
                >
                    <FontAwesomeIcon icon={faComments} className="me-2" /> Feedback
                </Nav.Link>
                </Nav>
            </Col>
            
            <Col md={10} className="content-wrapper">
                {/* Dashboard Section */}
                {activeTab === 'dashboard' && (
                <>
                    <h2 className="mb-4">Dashboard</h2>
                    <Row>
                    <Col md={3}>
                        <Card className="mb-4 border-primary">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted">Total Users</h6>
                                <h3>{totalUsers}</h3>
                            </div>
                            <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary" />
                            </div>
                        </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="mb-4 border-info">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted">Total Drivers</h6>
                                <h3>{totalDrivers}</h3>
                            </div>
                            <FontAwesomeIcon icon={faCarSide} size="2x" className="text-info" />
                            </div>
                        </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="mb-4 border-success">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted">Total Customers</h6>
                                <h3>{totalCustomers}</h3>
                            </div>
                            <FontAwesomeIcon icon={faUsers} size="2x" className="text-success" />
                            </div>
                        </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="mb-4 border-warning">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted">Total Rides</h6>
                                <h3>{totalRides}</h3>
                            </div>
                            <FontAwesomeIcon icon={faHistory} size="2x" className="text-warning" />
                            </div>
                        </Card.Body>
                        </Card>
                    </Col>
                    </Row>
                    
                    <Row>
                    <Col md={4}>
                        <Card className="mb-4">
                        <Card.Header>Ride Status</Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                            <span>Completed Rides</span>
                            <Badge bg="success">{completedRides}</Badge>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                            <span>Ongoing Rides</span>
                            <Badge bg="primary">{ongoingRides}</Badge>
                            </div>
                            <div className="d-flex justify-content-between">
                            <span>Pending Rides</span>
                            <Badge bg="warning">{pendingRides}</Badge>
                            </div>
                        </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col md={8}>
                        <Card className="mb-4">
                        <Card.Header>Recent Rides</Card.Header>
                        <Card.Body>
                            <Table responsive hover>
                            <thead>
                                <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Driver</th>
                                <th>Status</th>
                                <th>Fare</th>
                                <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rides.slice(0, 5).map(ride => (
                                <tr key={ride.id}>
                                    <td>{ride.id}</td>
                                    <td>{ride.customer_name}</td>
                                    <td>{ride.driver_name || 'Not Assigned'}</td>
                                    <td>
                                    <Badge bg={getStatusBadgeColor(ride.status)}>
                                        {ride.status}
                                    </Badge>
                                    </td>
                                    <td>${ride.fare || '-'}</td>
                                    <td>{new Date(ride.created_at).toLocaleDateString()}</td>
                                </tr>
                                ))}
                            </tbody>
                            </Table>
                        </Card.Body>
                        </Card>
                    </Col>
                    </Row>
                </>
                )}

                {/* User Management Section */}
                {activeTab === 'users' && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>User Management</h2>
                    <Button variant="primary">
                        <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                        Add New User
                    </Button>
                    </div>
                    
                    <Card className="mb-4">
                    <Card.Body>
                        <div className="mb-3">
                        <Form.Control 
                            type="text" 
                            placeholder="Search users by name, email or type..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        </div>
                        
                        <Table responsive hover>
                        <thead>
                            <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Created At</th>
                            <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                <Badge bg={getUserTypeBadgeColor(user.user_type)}>
                                    {user.user_type}
                                </Badge>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                <Button variant="info" size="sm" className="me-1" onClick={() => handleViewUser(user)}>
                                    <FontAwesomeIcon icon={faEye} />
                                </Button>
                                <Button variant="warning" size="sm" className="me-1">
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                <Button variant="danger" size="sm">
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </Table>
                    </Card.Body>
                    </Card>
                </>
                )}

                {/* Ride History Section */}
                {activeTab === 'rides' && (
                <>
                    <h2 className="mb-4">Ride History</h2>
                    
                    <Card className="mb-4">
                    <Card.Body>
                        <div className="mb-3 d-flex">
                        <Form.Control 
                            type="text" 
                            placeholder="Search rides..." 
                            className="me-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Form.Select 
                            style={{ width: '200px' }}
                            value={rideFilter}
                            onChange={(e) => setRideFilter(e.target.value)}
                        >
                            <option value="all">All Rides</option>
                            <option value="completed">Completed</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </Form.Select>
                        </div>
                        
                        <Table responsive hover>
                        <thead>
                            <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Driver</th>
                            <th>Pickup</th>
                            <th>Dropoff</th>
                            <th>Status</th>
                            <th>Fare</th>
                            <th>Date</th>
                            <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRides.map(ride => (
                            <tr key={ride.id}>
                                <td>{ride.id}</td>
                                <td>{ride.customer_name}</td>
                                <td>{ride.driver_name || 'Not Assigned'}</td>
                                <td>{ride.pickup_location}</td>
                                <td>{ride.dropoff_location}</td>
                                <td>
                                <Badge bg={getStatusBadgeColor(ride.status)}>
                                    {ride.status}
                                </Badge>
                                </td>
                                <td>${ride.fare || '-'}</td>
                                <td>{new Date(ride.created_at).toLocaleDateString()}</td>
                                <td>
                                <Button variant="info" size="sm" onClick={() => handleViewRide(ride)}>
                                    <FontAwesomeIcon icon={faEye} />
                                </Button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </Table>
                    </Card.Body>
                    </Card>
                </>
                )}

                {/* Driver Management Section */}
                {activeTab === 'drivers' && (
                <>
                    <h2 className="mb-4">Driver Management</h2>
                    
                    <Card className="mb-4">
                    <Card.Body>
                        <div className="mb-3">
                        <Form.Control 
                            type="text" 
                            placeholder="Search drivers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        </div>
                        
                        <Table responsive hover>
                        <thead>
                            <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Vehicle</th>
                            <th>License</th>
                            <th>Status</th>
                            <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map(driver => {
                            const driverUser = users.find(user => user.id === driver.id);
                            return (
                                <tr key={driver.id}>
                                <td>{driver.id}</td>
                                <td>{driverUser ? driverUser.name : 'Unknown'}</td>
                                <td>{driver.vehicle_number} ({driver.vehicle_type})</td>
                                <td>{driver.license_number}</td>
                                <td>
                                    <Badge bg={getDriverStatusBadgeColor(driver.status)}>
                                    {driver.status}
                                    </Badge>
                                </td>
                                <td>
                                    <Button variant="info" size="sm" className="me-1">
                                    <FontAwesomeIcon icon={faEye} />
                                    </Button>
                                    <Button variant="warning" size="sm" className="me-1">
                                    <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button variant="danger" size="sm">
                                    <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                                </tr>
                            );
                            })}
                        </tbody>
                        </Table>
                    </Card.Body>
                    </Card>
                </>
                )}

                {activeTab === 'payments' && (
                <div className="text-center py-5">
                    <h2>Payments Module</h2>
                    <p className="text-muted">Under Construction</p>
                </div>
                )}

                {activeTab === 'feedback' && (
                <div className="text-center py-5">
                    <h2>Feedback Module</h2>
                    <p className="text-muted">Under Construction</p>
                </div>
                )}
            </Col>
            </Row>
        </Container>

        {/* User Details Modal */}
        <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
            <Modal.Header closeButton>
            <Modal.Title>User Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {currentUser && (
                <div>
                <Row>
                    <Col md={4} className="text-center mb-3">
                    <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mx-auto" style={{ width: '100px', height: '100px' }}>
                        <h1>{currentUser.name.charAt(0)}</h1>
                    </div>
                    <h5 className="mt-2">{currentUser.name}</h5>
                    <Badge bg={getUserTypeBadgeColor(currentUser.user_type)} className="mt-1">
                        {currentUser.user_type}
                    </Badge>
                    </Col>
                    <Col md={8}>
                    <Table borderless>
                        <tbody>
                        <tr>
                            <td><strong>ID:</strong></td>
                            <td>{currentUser.id}</td>
                        </tr>
                        <tr>
                            <td><strong>Email:</strong></td>
                            <td>{currentUser.email}</td>
                        </tr>
                        <tr>
                            <td><strong>Registered:</strong></td>
                            <td>{new Date(currentUser.created_at).toLocaleString()}</td>
                        </tr>
                        </tbody>
                    </Table>
                    
                    {currentUser.user_type === 'Driver' && (
                        <>
                        <h5 className="mt-3">Driver Details</h5>
                        {drivers.filter(driver => driver.id === currentUser.id).map(driver => (
                            <Table borderless key={driver.id}>
                            <tbody>
                                <tr>
                                <td><strong>Vehicle:</strong></td>
                                <td>{driver.vehicle_type} ({driver.vehicle_number})</td>
                                </tr>
                                <tr>
                                <td><strong>License:</strong></td>
                                <td>{driver.license_number}</td>
                                </tr>
                                <tr>
                                <td><strong>Status:</strong></td>
                                <td>
                                    <Badge bg={getDriverStatusBadgeColor(driver.status)}>
                                    {driver.status}
                                    </Badge>
                                </td>
                                </tr>
                            </tbody>
                            </Table>
                        ))}
                        </>
                    )}
                    </Col>
                </Row>

                <Tabs defaultActiveKey="rides" className="mt-3">
                    <Tab eventKey="rides" title="Rides">
                    <Table responsive hover className="mt-3">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Fare</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rides
                            .filter(ride => 
                            (currentUser.user_type === 'Customer' && ride.customer_id === currentUser.id) || 
                            (currentUser.user_type === 'Driver' && ride.driver_id === currentUser.id)
                            )
                            .map(ride => (
                            <tr key={ride.id}>
                                <td>{ride.id}</td>
                                <td>{new Date(ride.created_at).toLocaleDateString()}</td>
                                <td>
                                <Badge bg={getStatusBadgeColor(ride.status)}>
                                    {ride.status}
                                </Badge>
                                </td>
                                <td>${ride.fare || '-'}</td>
                            </tr>
                            ))}
                        </tbody>
                    </Table>
                    </Tab>
                    <Tab eventKey="logs" title="Activity Logs">
                    <div className="p-3 text-center text-muted">
                        No activity logs found
                    </div>
                    </Tab>
                </Tabs>
                </div>
            )}
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUserModal(false)}>
                Close
            </Button>
            <Button variant="primary">
                Edit User
            </Button>
            </Modal.Footer>
        </Modal>

        {/* Ride Details Modal */}
        <Modal show={showRideDetailsModal} onHide={() => setShowRideDetailsModal(false)} size="lg">
            <Modal.Header closeButton>
            <Modal.Title>Ride Details #{currentRide?.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {currentRide && (
                <>
                <Card className="mb-3">
                    <Card.Body>
                    <Row>
                        <Col md={5}>
                        <div className="mb-3">
                            <small className="text-muted d-block">Status</small>
                            <Badge bg={getStatusBadgeColor(currentRide.status)} className="fs-6">
                            {currentRide.status}
                            </Badge>
                        </div>
                        
                        <div className="mb-3">
                            <small className="text-muted d-block">Customer</small>
                            <span>{currentRide.customer_name}</span>
                        </div>
                        
                        <div className="mb-3">
                            <small className="text-muted d-block">Driver</small>
                            <span>{currentRide.driver_name || 'Not Assigned'}</span>
                        </div>
                        </Col>
                        
                        <Col md={7}>
                        <div className="mb-3">
                            <small className="text-muted d-block">Pickup Location</small>
                            <span>{currentRide.pickup_location}</span>
                        </div>
                        
                        <div className="mb-3">
                            <small className="text-muted d-block">Dropoff Location</small>
                            <span>{currentRide.dropoff_location}</span>
                        </div>
                        
                        <div className="mb-3">
                            <small className="text-muted d-block">Vehicle</small>
                            <span>{currentRide.vehicle || 'Not Assigned'}</span>
                        </div>
                        </Col>
                    </Row>

                    <hr />

                    <Row>
                        <Col md={4}>
                        <div className="mb-3">
                            <small className="text-muted d-block">Created At</small>
                            <span>{new Date(currentRide.created_at).toLocaleString()}</span>
                        </div>
                        </Col>
                        
                        <Col md={4}>
                        <div className="mb-3">
                            <small className="text-muted d-block">Start Time</small>
                            <span>{currentRide.start_time ? new Date(currentRide.start_time).toLocaleString() : '-'}</span>
                        </div>
                        </Col>
                        
                        <Col md={4}>
                        <div className="mb-3">
                            <small className="text-muted d-block">End Time</small>
                            <span>{currentRide.end_time ? new Date(currentRide.end_time).toLocaleString() : '-'}</span>
                        </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                        <div className="mb-3">
                            <small className="text-muted d-block">Fare</small>
                            <h4>${currentRide.fare || '-'}</h4>
                        </div>
                        </Col>
                        
                        <Col md={4}>
                        <div className="mb-3">
                            <small className="text-muted d-block"></small>
                            <small className="text-muted d-block">Passengers</small>
                        <span>{currentRide.passengers}</span>
                      </div>
                    </Col>
                    
                    <Col md={4}>
                      <div className="mb-3">
                        <small className="text-muted d-block">Rating</small>
                        <span>{currentRide.rating || 'No rating yet'}</span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Tabs defaultActiveKey="timeline" className="mt-3">
                <Tab eventKey="timeline" title="Timeline">
                  <div className="p-3">
                    <ul className="timeline">
                      <li className="timeline-item">
                        <div className="timeline-marker bg-success"></div>
                        <div className="timeline-content">
                          <h6 className="mb-0">Ride Created</h6>
                          <small className="text-muted">{new Date(currentRide.created_at).toLocaleString()}</small>
                          <p>Customer requested a ride</p>
                        </div>
                      </li>
                      
                      {currentRide.driver_name && (
                        <li className="timeline-item">
                          <div className="timeline-marker bg-info"></div>
                          <div className="timeline-content">
                            <h6 className="mb-0">Driver Assigned</h6>
                            <small className="text-muted">
                              {new Date(currentRide.created_at).getTime() + 300000 > new Date().getTime() 
                                ? new Date(new Date(currentRide.created_at).getTime() + 300000).toLocaleString()
                                : new Date(currentRide.created_at).toLocaleString()}
                            </small>
                            <p>{currentRide.driver_name} assigned to the ride</p>
                          </div>
                        </li>
                      )}
                      
                      {currentRide.start_time && (
                        <li className="timeline-item">
                          <div className="timeline-marker bg-primary"></div>
                          <div className="timeline-content">
                            <h6 className="mb-0">Ride Started</h6>
                            <small className="text-muted">{new Date(currentRide.start_time).toLocaleString()}</small>
                            <p>Pickup from {currentRide.pickup_location}</p>
                          </div>
                        </li>
                      )}
                      
                      {currentRide.end_time && (
                        <li className="timeline-item">
                          <div className="timeline-marker bg-success"></div>
                          <div className="timeline-content">
                            <h6 className="mb-0">Ride Completed</h6>
                            <small className="text-muted">{new Date(currentRide.end_time).toLocaleString()}</small>
                            <p>Dropoff at {currentRide.dropoff_location}</p>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </Tab>
                <Tab eventKey="map" title="Route Map">
                  <div className="p-3 text-center">
                    <p className="text-muted">Map integration coming soon</p>
                    <div className="border p-3 mt-2">
                      <p>From: {currentRide.pickup_location}</p>
                      <p>To: {currentRide.dropoff_location}</p>
                    </div>
                  </div>
                </Tab>
                <Tab eventKey="feedback" title="Feedback">
                  <div className="p-3">
                    {currentRide.rating !== 'Neutral' ? (
                      <div>
                        <h6>Rating: {currentRide.rating}</h6>
                        <p className="text-muted">No additional comments provided.</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted">
                        No feedback available for this ride
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRideDetailsModal(false)}>
            Close
          </Button>
          {currentRide && currentRide.status === 'Pending' && (
            <Button variant="success">
              Assign Driver
            </Button>
          )}
          {currentRide && currentRide.status === 'Ongoing' && (
            <Button variant="primary">
              Track Ride
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;