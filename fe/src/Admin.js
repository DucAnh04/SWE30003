import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalInstance, setUserModalInstance] = useState(null);

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8000/users/get-users', {
        params: { page: currentPage, limit: pageSize }
      });
      setUsers(response.data.users);
      setTotalPages(response.data.pages || 1);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
      setIsLoading(false);
    }
  };

  // Fetch feedback from the API
  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8000/feedbacks/all-feedback', {
        params: { page: currentPage, limit: pageSize }
      });
      setFeedback(response.data.feedback);
      setTotalPages(response.data.pages || 1);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback. Please try again later.');
      setIsLoading(false);
    }
  };

  // Handle user deletion with API call
  const handleDeleteUser = async (userId) => {
    if (confirmDelete === userId) {
      try {
        await axios.delete(`http://localhost:8000/users/delete-user/${userId}`);
        fetchUsers(); // Refresh the user list
        setConfirmDelete(null);
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      }
    } else {
      setConfirmDelete(userId);
    }
  };
  
  // Handle view user details without direct Bootstrap dependency
  const handleViewUser = (user) => {
    setSelectedUser(user);
    // Use jQuery if available, otherwise use DOM API
    const userModalEl = document.getElementById('userDetailModal');
    if (window.jQuery && window.jQuery.fn.modal) {
      window.jQuery(userModalEl).modal('show');
    } else {
      // Fallback to manually adding the classes for display
      userModalEl.classList.add('show');
      userModalEl.style.display = 'block';
      userModalEl.setAttribute('aria-modal', 'true');
      userModalEl.removeAttribute('aria-hidden');
      document.body.classList.add('modal-open');
      
      // Add modal backdrop if it doesn't exist
      let backdrop = document.querySelector('.modal-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.classList.add('modal-backdrop', 'fade', 'show');
        document.body.appendChild(backdrop);
      }
    }
  };

  // Function to close modal manually
  const closeModal = (modalId) => {
    const modalEl = document.getElementById(modalId);
    if (window.jQuery && window.jQuery.fn.modal) {
      window.jQuery(modalEl).modal('hide');
    } else {
      modalEl.classList.remove('show');
      modalEl.style.display = 'none';
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.removeAttribute('aria-modal');
      document.body.classList.remove('modal-open');
      
      // Remove backdrop
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        document.body.removeChild(backdrop);
      }
    }
  };

  // Handle feedback deletion with API call
  const handleDeleteFeedback = async (feedbackId) => {
    if (confirmDelete === feedbackId) {
      try {
        await axios.delete(`http://localhost:8000/feedbacks/delete-feedback/${feedbackId}`);
        fetchFeedback(); // Refresh the feedback list
        setConfirmDelete(null);
      } catch (err) {
        console.error('Error deleting feedback:', err);
        setError('Failed to delete feedback. Please try again.');
      }
    } else {
      setConfirmDelete(feedbackId);
    }
  };
  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter feedback based on search term
  const filteredFeedback = feedback.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.review?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load data when component mounts or when tab/page changes
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchFeedback();
    }
  }, [activeTab, currentPage, pageSize]);

  // Reset to first page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Setup click handlers for close buttons in modals
  useEffect(() => {
    // Add event listeners for close buttons
    const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"]');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const modalId = button.closest('.modal').id;
        closeModal(modalId);
      });
    });

    // Clean up event listeners
    return () => {
      closeButtons.forEach(button => {
        button.removeEventListener('click', () => {});
      });
    };
  }, []);
  
  // Pagination Component
  const Pagination = () => (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <div>
        <select 
          className="form-select" 
          value={pageSize} 
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
      <nav>
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          {[...Array(totalPages).keys()].map((number) => (
            <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(number + 1)}
              >
                {number + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Admin Management</h2>
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      
      {/* Navigation tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} 
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'feedback' ? 'active' : ''}`} 
            onClick={() => setActiveTab('feedback')}
          >
            Manage Feedback
          </button>
        </li>
      </ul>
      
      {/* Search bar */}
      <div className="input-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
          Clear
        </button>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading data...</p>
        </div>
      )}
      
      {/* Users Table */}
      {!isLoading && activeTab === 'users' && (
        <div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        {user.profile_picture ? (
                          <span className="d-flex align-items-center">
                            <img 
                              src={`http://localhost:8000/images/${user.profile_picture}`} 
                              alt={user.name} 
                              className="rounded-circle me-2" 
                              width="30" 
                              height="30"
                            />
                            {user.name}
                          </span>
                        ) : (
                          user.name
                        )}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${
                          user.user_type === 'Admin' ? 'bg-danger' : 
                          user.user_type === 'Driver' ? 'bg-warning text-dark' : 
                          'bg-success'
                        }`}>
                          {user.user_type}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => handleViewUser(user)}
                          >
                            View
                          </button>
                          <button 
                            className={`btn btn-sm ${confirmDelete === user.id ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            {confirmDelete === user.id ? 'Confirm' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <p>Total Users: {filteredUsers.length}</p>
          </div>
          <Pagination />
        </div>
      )}
      
      {/* Feedback Table */}
      {!isLoading && activeTab === 'feedback' && (
        <div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Rating</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedback.length > 0 ? (
                  filteredFeedback.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>
                        <div className="d-flex">
                          {[...Array(5)].map((_, index) => (
                            <span key={index} className="text-warning">
                              {index < item.rating ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {item.review.length > 50 
                          ? `${item.review.substring(0, 50)}...` 
                          : item.review}
                      </td>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => {
                              window.feedbackDetail = item;
                              const feedbackModalEl = document.getElementById('feedbackDetailModal');
                              if (window.jQuery && window.jQuery.fn.modal) {
                                window.jQuery(feedbackModalEl).modal('show');
                              } else {
                                feedbackModalEl.classList.add('show');
                                feedbackModalEl.style.display = 'block';
                                feedbackModalEl.setAttribute('aria-modal', 'true');
                                feedbackModalEl.removeAttribute('aria-hidden');
                                document.body.classList.add('modal-open');
                                
                                let backdrop = document.querySelector('.modal-backdrop');
                                if (!backdrop) {
                                  backdrop = document.createElement('div');
                                  backdrop.classList.add('modal-backdrop', 'fade', 'show');
                                  document.body.appendChild(backdrop);
                                }
                              }
                            }}
                          >
                            View
                          </button>
                          <button 
                            className={`btn btn-sm ${confirmDelete === item.id ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => handleDeleteFeedback(item.id)}
                          >
                            {confirmDelete === item.id ? 'Confirm' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">No feedback found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <p>Total Feedback: {filteredFeedback.length}</p>
          </div>
          <Pagination />
        </div>
      )}

      {/* User Detail Modal */}
      <div className="modal fade" id="userDetailModal" tabIndex="-1" aria-labelledby="userDetailModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="userDetailModalLabel">User Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedUser && (
                <div>
                  <div className="text-center mb-3">
                    {selectedUser.profile_picture ? (
                      <img 
                        src={`http://localhost:8000/images/${selectedUser.profile_picture}`} 
                        alt={selectedUser.name} 
                        className="rounded-circle" 
                        width="100" 
                        height="100"
                      />
                    ) : (
                      <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{width: "100px", height: "100px"}}>
                        <span className="text-white fs-1">{selectedUser.name?.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 fw-bold">ID:</div>
                    <div className="col-8">{selectedUser.id}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 fw-bold">Name:</div>
                    <div className="col-8">{selectedUser.name}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 fw-bold">Email:</div>
                    <div className="col-8">{selectedUser.email}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 fw-bold">Role:</div>
                    <div className="col-8">
                      <span className={`badge ${
                        selectedUser.user_type === 'Admin' ? 'bg-danger' : 
                        selectedUser.user_type === 'Driver' ? 'bg-warning text-dark' : 
                        'bg-success'
                      }`}>
                        {selectedUser.user_type}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 fw-bold">Join Date:</div>
                    <div className="col-8">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 fw-bold">Phone:</div>
                    <div className="col-8">{selectedUser.phone || 'Not provided'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 fw-bold">Address:</div>
                    <div className="col-8">{selectedUser.address || 'Not provided'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 fw-bold">Status:</div>
                    <div className="col-8">
                      <span className={`badge ${selectedUser.active ? 'bg-success' : 'bg-danger'}`}>
                        {selectedUser.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              {selectedUser && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    handleDeleteUser(selectedUser.id);
                    closeModal('userDetailModal');
                  }}
                >
                  Delete User
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Detail Modal */}
      <div className="modal fade" id="feedbackDetailModal" tabIndex="-1" aria-labelledby="feedbackDetailModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="feedbackDetailModalLabel">Feedback Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {window.feedbackDetail && (
                <div>
                  <p><strong>From:</strong> {window.feedbackDetail.name} ({window.feedbackDetail.email})</p>
                  <p><strong>Phone:</strong> {window.feedbackDetail.phone || 'Not provided'}</p>
                  <p><strong>How they found us:</strong> {window.feedbackDetail.find_us}</p>
                  <p>
                    <strong>Rating:</strong> {window.feedbackDetail.rating}/5
                    <span className="ms-2">
                      {[...Array(5)].map((_, index) => (
                        <span key={index} className="text-warning">
                          {index < window.feedbackDetail.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </span>
                  </p>
                  <p><strong>Date:</strong> {window.feedbackDetail.date}</p>
                  <div className="mt-3">
                    <strong>Feedback:</strong>
                    <p className="border p-3 rounded bg-light">{window.feedbackDetail.review}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              {window.feedbackDetail && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    handleDeleteFeedback(window.feedbackDetail.id);
                    closeModal('feedbackDetailModal');
                  }}
                >
                  Delete Feedback
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;