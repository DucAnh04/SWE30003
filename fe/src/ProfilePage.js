import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import axios from 'axios';

const ProfileManagementPage = () => {
  // User state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit mode and form states
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  
  // Password change state
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Rides history state
  const [rides, setRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
    fetchRideHistory();
  }, []);

  // Date formatting helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  // Time formatting helper function
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toTimeString().slice(0, 5); // Returns HH:MM
  };

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      // Get token from local storage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }
  
      // Pass token as a query parameter
      const response = await axios.get(`http://localhost:8000/users/me?token=${token}`);
  
      setUser(response.data);
      setEditedUser(response.data);
      
      // Fetch profile picture
      if (response.data.profile_picture) {
        const profilePicResponse = await axios.get(`http://localhost:8000/images/${response.data.profile_picture}`, {
          responseType: 'blob'
        });
        setProfileImage(URL.createObjectURL(profilePicResponse.data));
      }

      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch user data');
      setIsLoading(false);
      // Handle token expiration or unauthorized access
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  // Fetch ride history
  const fetchRideHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }
      console.log(token)
      axios.get(`http://localhost:8000/rides/all/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        setRides(response.data);
      })

      setLoadingRides(false);
    } catch (err) {
      console.error('Failed to fetch ride history:', err);
      setLoadingRides(false);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'in progress':
        return 'primary';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:8000/users/upload-profile-picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        // Update profile picture
        setProfileImage(URL.createObjectURL(file));
        setUser(prev => ({
          ...prev,
          profile_picture: response.data.filename
        }));
        setSuccess('Profile picture uploaded successfully');
      } catch (err) {
        setError('Failed to upload profile picture');
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Validate inputs
      if (!editedUser.name || !editedUser.email) {
        setError('Name and Email are required');
        return;
      }

      // Prepare form data for update
      const formData = new FormData();
      formData.append('name', editedUser.name);
      formData.append('email', editedUser.email);

      // If driver, add driver-specific details
      if (user.user_type === 'Driver' && user.driver_details) {
        formData.append('vehicle_number', editedUser.driver_details.vehicle_number);
        formData.append('vehicle_type', editedUser.driver_details.vehicle_type);
      }

      // Make API call to update profile
      const response = await axios.put('/api/users/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Update user state
      setUser(response.data);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setError('');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  // Password change handler
  const submitPasswordChange = async () => {
    // Clear previous messages
    setError('');
    setSuccess('');
  
    // Validation
    if (!passwordChange.currentPassword || 
        !passwordChange.newPassword || 
        !passwordChange.confirmPassword) {
      setError('All password fields are required');
      return;
    }
  
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append("token", token);
      formData.append("current_password", passwordChange.currentPassword);
      formData.append("new_password", passwordChange.newPassword);
      
      await axios.post(
        "http://localhost:8000/users/change-password",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    
      setSuccess("Password changed successfully");

      // Reset password fields
      setPasswordChange({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password');
    }
  };


  // Render star rating
  const renderRating = (rating) => {
    if (!rating) return 'N/A';
    
    const fullStars = Math.floor(rating);
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
      stars += '★';
    }
    
    for (let i = fullStars; i < 5; i++) {
      stars += '☆';
    }
    
    return `${stars} (${rating})`;
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // If no user data, show error
  if (!user) {
    return (
      <Container>
        <Alert variant="danger">Failed to load user data</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header>
          <h2 className="text-center">Profile Management</h2>
        </Card.Header>
        <Card.Body>
          {/* Error and Success Alerts */}
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onClose={() => setSuccess('')} dismissible>
              {success}
            </Alert>
          )}

          {/* Profile Picture */}
          <Row className="mb-4 d-flex justify-content-center align-items-center">
            <Col md={4} className="text-center">
              <div style={{
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                overflow: 'hidden', 
                margin: '0 auto'
              }}>
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  />
                ) : (
                  <div 
                    style={{
                      width: '100%', 
                      height: '100%', 
                      backgroundColor: '#e9ecef', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center'
                    }}
                  >
                    No Image
                  </div>
                )}
              </div>
              {isEditing && (
                <Form.Group controlId="formFile" className="mt-3">
                  <Form.Control 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Form.Group>
              )}
            </Col>
            <Col md={8}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className='fw-bold'>Name:</Form.Label>
                  {isEditing ? (
                    <Form.Control 
                      type="text" 
                      name="name"
                      value={editedUser.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <Form.Control plaintext readOnly defaultValue={user.name} />
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className='fw-bold'>Email:</Form.Label>
                  {isEditing ? (
                    <Form.Control 
                      type="email" 
                      name="email"
                      value={editedUser.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <Form.Control plaintext readOnly defaultValue={user.email} />
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className='fw-bold'>User Type:</Form.Label>
                  <Form.Control plaintext readOnly defaultValue={user.user_type} />
                </Form.Group>
              </Form>
            </Col>
          </Row>

          {/* Driver-Specific Details */}
          {user.user_type === 'Driver' && user.driver_details && (
            <Card className="mb-4">
              <Card.Header>Driver Details</Card.Header>
              <Card.Body>
                <Row>
                <Col md={4} className="d-flex justify-content-center align-items-center">
                  <div style={{
                    width: '200px', 
                    height: '200px', 
                    borderRadius: '10px', 
                    overflow: 'hidden'
                  }}>
                    <img 
                      src="/image/Profile.png" 
                      alt="License" 
                      style={{width: '100%', height: '100%', objectFit: 'cover'}}
                    />
                  </div>
                </Col>

                  <Col md={8}>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label className='fw-bold'>Vehicle Number:</Form.Label>
                        {isEditing ? (
                          <Form.Control 
                            type="text" 
                            name="vehicle_number"
                            value={editedUser.driver_details.vehicle_number}
                            onChange={(e) => {
                              const { name, value } = e.target;
                              setEditedUser(prev => ({
                                ...prev,
                                driver_details: {
                                  ...prev.driver_details,
                                  [name]: value
                                }
                              }));
                            }}
                          />
                        ) : (
                          <Form.Control plaintext readOnly defaultValue={user.driver_details.vehicle_number} />
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className='fw-bold'>Vehicle Type:</Form.Label>
                        {isEditing ? (
                          <Form.Select 
                            name="vehicle_type"
                            value={editedUser.driver_details.vehicle_type}
                            onChange={(e) => {
                              const { name, value } = e.target;
                              setEditedUser(prev => ({
                                ...prev,
                                driver_details: {
                                  ...prev.driver_details,
                                  [name]: value
                                }
                              }));
                            }}
                          >
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Hatchback">Hatchback</option>
                            <option value="Luxury">Luxury</option>
                          </Form.Select>
                        ) : (
                          <Form.Control plaintext readOnly defaultValue={user.driver_details.vehicle_type} />
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className='fw-bold'>License Number:</Form.Label>
                        <Form.Control plaintext readOnly defaultValue={user.driver_details.license_number} />
                      </Form.Group>

                      <Row>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Total Rides:</Form.Label>
                            <Form.Control 
                              plaintext 
                              readOnly 
                              defaultValue={user.driver_details.total_rides || 'N/A'}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Average Rating:</Form.Label>
                            <Form.Control 
                              plaintext 
                              readOnly 
                              defaultValue={user.driver_details.average_rating ? `${user.driver_details.average_rating}/5` : 'N/A'}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label className='fw-bold'>Current Status:</Form.Label>
                        <Form.Control 
                          plaintext 
                          readOnly 
                          defaultValue={user.driver_details.current_status}
                        />
                      </Form.Group>
                    </Form>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Ride History Section */}
          <Card className="mb-4">
            <Card.Header>
              <h3>Ride History</h3>
            </Card.Header>
            <Card.Body>
              {loadingRides ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading ride history...</span>
                  </Spinner>
                </div>
              ) : rides.length > 0 ? (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Ride ID</th>
                        <th>Pickup Location</th>
                        <th>Dropoff Location</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Fare</th>
                        <th>Vehicle</th>
                        <th>Rating</th>
                        {user.user_type === 'Customer' ? (
                          <th>Driver</th>
                        ) : (
                          <th>Customer</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {rides.map((ride) => (
                        <tr key={ride.ride_id}>
                          <td>{ride.ride_id}</td>
                          <td>{ride.pickup_location}</td>
                          <td>{ride.dropoff_location}</td>
                          <td>
                            <Badge bg={getStatusBadgeVariant(ride.status)}>
                              {ride.status}
                            </Badge>
                          </td>
                          <td>{formatDate(ride.created_at)}</td>
                          <td>
                            {formatTime(ride.start_time)} - {formatTime(ride.end_time)}
                          </td>
                          <td>${ride.fare ? ride.fare.toFixed(2) : 'N/A'}</td>
                          <td>{ride.vehicle || 'N/A'}</td>
                          <td>{renderRating(ride.rating)}</td>
                          <td>
                            {user.user_type === 'Customer' 
                              ? ride.driver_name || 'Not Assigned'
                              : ride.customer_name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="info">No ride history found.</Alert>
              )}
            </Card.Body>
          </Card>

          {/* Edit/Save Buttons */}
          <Row>
            <Col>
              {isEditing ? (
                <>
                  <Button 
                    variant="primary" 
                    onClick={saveProfileChanges} 
                    className="me-2"
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setIsEditing(false);
                      setEditedUser(user);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button 
                  variant="primary" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Col>
          </Row>

          {/* Password Change Section */}
          <Row className="mt-4">
            <Col>
              <Card>
                <Card.Header>Change Password</Card.Header>
                <Card.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control 
                        type="password"
                        name="currentPassword"
                        value={passwordChange.currentPassword}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          setPasswordChange(prev => ({
                            ...prev,
                            [name]: value
                          }));
                        }}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control 
                        type="password"
                        name="newPassword"
                        value={passwordChange.newPassword}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          setPasswordChange(prev => ({
                            ...prev,
                            [name]: value
                          }));
                        }}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control 
                        type="password"
                        name="confirmPassword"
                        value={passwordChange.confirmPassword}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          setPasswordChange(prev => ({
                            ...prev,
                            [name]: value
                          }));
                        }}
                      />
                    </Form.Group>
                    <Button 
                      variant="primary" 
                      onClick={submitPasswordChange}
                    >
                      Change Password
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfileManagementPage;