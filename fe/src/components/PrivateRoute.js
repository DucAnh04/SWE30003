import { jwtDecode } from "jwt-decode";
import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ element, ...rest }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/" />;
  }

  try {
    // Decode the token to get the user role
    const decodedToken = jwtDecode(token);

    if (decodedToken.user_type !== "Admin") {
      // If the role is not "admin", redirect to a different page (e.g., home or login)
      return <Navigate to="/" />;
    }
    
    return element; // If the role is "admin", render the element (AdminDashboard)
  } catch (error) {
    // If decoding fails or there's an error, redirect to login
    return <Navigate to="/" />;
  }
};
export default PrivateRoute;
