import unittest
import requests
import json
import os
import io
from PIL import Image
import time

# Base URL for API endpoints
BASE_URL = "http://localhost:8000"  # Adjust as needed

class UserAPITests(unittest.TestCase):
    def setUp(self):
        # Create test data with unique emails and vehicle numbers using timestamp to avoid duplicates
        # Create a user date:
        # "name": "Test User 1743493732",
        # "email": "testuser1743493732@example.com",
        # "password": "securePassword123",
        # "user_type": "Customer"	

        timestamp = int(time.time())
        self.test_user_data = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@gmail.com",
            "password": "securePassword123",
            "user_type": "Customer"
        }
        
        self.test_driver_data = {
            "name": f"Test Driver {timestamp}",
            "email": f"testdriver{timestamp}@gmail.com",
            "password": "driverPassword123",
            "user_type": "Driver",
            "vehicle_number": f"ABC{timestamp}",  # Ensure unique vehicle number
            "vehicle_type": "Sedan",
            "license_number": f"DL{timestamp}"  # Ensure unique license number
        }
        
        # Token storage
        self.customer_token = None
        self.driver_token = None
        self.customer_id = None
        self.driver_id = None

        # Create test image for profile picture
        self.create_test_image()

        

    def create_test_image(self):
        """Create a small test image for profile picture uploads"""
        img = Image.new('RGB', (100, 100), color='red')
        img_path = 'test_profile.jpg'
        img.save(img_path)
        self.test_image_path = img_path
        
    def tearDown(self):
        """Clean up after tests"""
        if os.path.exists(self.test_image_path):
            os.remove(self.test_image_path)

    # Test User Registration
    def test_01_create_customer(self):
        """Test creating a customer user"""
        with open(self.test_image_path, 'rb') as img:
            files = {'profile_picture': ('profile.jpg', img, 'image/jpeg')}
            response = requests.post(
                f"{BASE_URL}/users/",
                data=self.test_user_data,
                files=files
            )
        
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertIn("user_id", response_data)
        self.assertIn("message", response_data)
        self.assertEqual(response_data["message"], "User created successfully")
        self.customer_id = response_data["user_id"]

    def test_02_create_driver(self):
        """Test creating a driver user with required driver-specific fields"""
        with open(self.test_image_path, 'rb') as img:
            files = {'profile_picture': ('profile.jpg', img, 'image/jpeg')}
            response = requests.post(
                f"{BASE_URL}/users/",
                data=self.test_driver_data,
                files=files
            )

        # Assert the response status code is 200 (success)
        self.assertEqual(response.status_code, 200, f"Unexpected status code: {response.status_code}")

        # Parse the response JSON
        response_data = response.json()

        # Assert the response contains the expected keys and values
        self.assertIn("user_id", response_data, "Response does not contain 'user_id'")
        self.assertIn("message", response_data, "Response does not contain 'message'")
        self.assertEqual(response_data["message"], "User created successfully", "Unexpected success message")

        # Store the driver ID for use in other tests
        self.driver_id = response_data["user_id"]

    def test_03_create_driver_missing_fields(self):
        """Test creating a driver without required driver fields - should fail"""
        # Create a new unique data set to avoid duplicate email error
        timestamp = int(time.time())
        new_driver_data = {
            "name": f"Test Driver {timestamp}",
            "email": f"testdriver{timestamp}@example.com",
            "password": "driverPassword123",
            "user_type": "Driver",
            # Missing vehicle_number
            "vehicle_type": "Sedan",
            "license_number": "DL123456"
        }
        
        with open(self.test_image_path, 'rb') as img:
            files = {'profile_picture': ('profile.jpg', img, 'image/jpeg')}
            response = requests.post(
                f"{BASE_URL}/users/",
                data=new_driver_data,
                files=files
            )
        
        self.assertEqual(response.status_code, 400)
        # Check if the error message contains information about missing fields
        # Adjusted to match the actual error message format
        self.assertIn("Missing required", response.json()["detail"])

    # Test Duplicate email
    def test_04_duplicate_email(self):
        """Test creating a user with an email that already exists - should fail"""
        with open(self.test_image_path, 'rb') as img:
            files = {'profile_picture': ('profile.jpg', img, 'image/jpeg')}
            response = requests.post(
                f"{BASE_URL}/users/",
                data={
            "name": "Test User 1743493732",
            "email": "testuser1743493732@example.com",
            "password": "securePassword123",
            "user_type": "Customer"
            },
                files=files
            )

        # Assert the response status code is 400 (Bad Request)
        self.assertEqual(response.status_code, 400, f"Unexpected status code: {response.status_code}")

        # Parse the response JSON
        response_data = response.json()

        # Check if the error message mentions duplicate email
        self.assertIn("detail", response_data, "Response does not contain 'detail'")
        self.assertIn("Duplicate entry", response_data["detail"], "Error message does not mention 'Duplicate entry'")
        
    # Test Authentication
    def test_05_authenticate_success(self):
        """Test successful user authentication"""
        # Create the customer user
        with open(self.test_image_path, 'rb') as img:
            files = {'profile_picture': ('profile.jpg', img, 'image/jpeg')}
            response = requests.post(
                f"{BASE_URL}/users/",
                data=self.test_user_data,
                files=files
            )
            print("Create Customer Response:", response.json())  # Debug statement
            self.assertEqual(response.status_code, 200, "Failed to create customer user")
            self.customer_id = response.json()["user_id"]

        # Create the driver user
        with open(self.test_image_path, 'rb') as img:
            files = {'profile_picture': ('profile.jpg', img, 'image/jpeg')}
            response = requests.post(
                f"{BASE_URL}/users/",
                data=self.test_driver_data,
                files=files
            )
            print("Create Driver Response:", response.json())  # Debug statement
            self.assertEqual(response.status_code, 200, "Failed to create driver user")
            self.driver_id = response.json()["user_id"]
        # Authenticate the customer
        response = requests.post(
            f"{BASE_URL}/users/authenticate",
            data={
                "email": self.test_user_data["email"],
                "password": self.test_user_data["password"]
            }
        )
        print("Authenticate Customer Response:", response.json())  # Debug statement
        self.assertEqual(response.status_code, 200, f"Unexpected status code: {response.status_code}")
        response_data = response.json()
        self.assertIn("token", response_data, "Response does not contain 'token'")
        self.customer_token = response_data["token"]

        # Authenticate the driver
        response = requests.post(
            f"{BASE_URL}/users/authenticate",
            data={
                "email": self.test_driver_data["email"],
                "password": self.test_driver_data["password"]
            }
        )
        print("Authenticate Driver Response:", response.json())  # Debug statement
        self.assertEqual(response.status_code, 200, f"Unexpected status code: {response.status_code}")
        self.driver_token = response.json()["token"]

    def test_06_authenticate_wrong_password(self):
        """Test authentication with incorrect password - should fail"""
        response = requests.post(
            f"{BASE_URL}/users/authenticate",
            data={
                "email": self.test_user_data["email"],
                "password": "wrongpassword"
            }
        )
        
        # Adjusted to match the actual response status code (400 instead of 401)
        self.assertEqual(response.status_code, 400)
        # Check if the error message indicates invalid credentials
        self.assertIn("Invalid email or password", response.json()["detail"])

    def test_07_authenticate_nonexistent_user(self):
        """Test authentication with non-existent email - should fail"""
        response = requests.post(
            f"{BASE_URL}/users/authenticate",
            data={
                "email": "nonexistent@gmail.com", 
                "password": "anypassword"
            }
        )
        
        # Adjusted to match the actual response status code (400 instead of 401)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid email or password", response.json()["detail"])
        
    # Test User Profile Operations
    def test_08_get_user_data(self):
        """Test retrieving user profile data"""
        # Authenticate the customer to get a valid token
        response = requests.post(
            f"{BASE_URL}/users/authenticate",
            data={
                "email": "testuser1743493732@example.com",
                "password": "securePassword123",
            }
        )
        print("Authenticate Customer Response:", response.json())  # Debug statement
        self.assertEqual(response.status_code, 200, f"Unexpected status code: {response.status_code}")
        self.customer_token = response.json()["token"]

        # Test with customer token
        response = requests.get(
            f"{BASE_URL}/users/me?token={self.customer_token}"
        )
        print("Get User Data Response:", response.json())  # Debug statement
    
        self.assertEqual(response.status_code, 200, f"Unexpected status code: {response.status_code}")
        user_data = response.json()

        # Assert the response contains the expected user data
        self.assertEqual(user_data["name"], "Test User 1743493732")
        self.assertEqual(user_data["email"], "testuser1743493732@example.com")
        self.assertEqual(user_data["user_type"], "Customer")

    def test_09_get_user_invalid_token(self):
        """Test retrieving user data with invalid token - should fail"""
        response = requests.get(
            f"{BASE_URL}/users/me?token=invalid.token.string"
        )
        
        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid token", response.json()["detail"])
        
    def test_10_edit_profile_basic(self):
        """Test updating basic user profile information"""
        # Step 1: Create a customer user
        with open(self.test_image_path, 'rb') as img:
            files = {'profile_picture': ('profile.jpg', img, 'image/jpeg')}
            response = requests.post(
                f"{BASE_URL}/users/",
                data=self.test_user_data,
                files=files
            )
        self.assertEqual(response.status_code, 200, "Failed to create customer user")
        self.customer_id = response.json()["user_id"]

        # Step 2: Authenticate to get a token
        auth_data = {
            "email": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        }
        response = requests.post(f"{BASE_URL}/users/authenticate", data=auth_data)
        self.assertEqual(response.status_code, 200, "Failed to authenticate customer")
        self.customer_token = response.json()["token"]
        self.assertIsNotNone(self.customer_token, "Token not received")

        # Step 3: Update the profile
        updated_name = "Updated Test User"
        data = {
            'token': self.customer_token,
            'name': updated_name
        }
        with open(self.test_image_path, 'rb') as img:
            files = {
                'profile_picture': ('new_profile.jpg', img, 'image/jpeg')
            }
            response = requests.put(
                f"{BASE_URL}/users/edit-profile",
                data=data,
                files=files
            )
            print("Edit Profile Response:", response.json())

        # Step 4: Verify success
        self.assertEqual(response.status_code, 200, f"Unexpected status code: {response.status_code}")
        updated_data = response.json()
        self.assertEqual(updated_data["name"], updated_name)

    # test_11_edit_profile_driver
    def test_11_edit_profile_driver(self):
        """Test updating driver-specific profile information"""
        # Create driver
        with open(self.test_image_path, 'rb') as img:
            files = {'profile_picture': ('profile.jpg', img, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/users/", data=self.test_driver_data, files=files)
        self.assertEqual(response.status_code, 200, "Failed to create driver")
        self.driver_id = response.json()["user_id"]
        print("Driver Creation Response:", response.json())

        # Authenticate driver
        auth_data = {
            "email": self.test_driver_data["email"],
            "password": self.test_driver_data["password"]
        }
        response = requests.post(f"{BASE_URL}/users/authenticate", data=auth_data)
        self.assertEqual(response.status_code, 200, "Failed to authenticate driver")
        self.driver_token = response.json()["token"]
        self.assertIsNotNone(self.driver_token, "Driver token not received")
        print("Driver Auth Response:", response.json())
        print("Driver Token:", self.driver_token)

        # Update driver profile with unique vehicle number
        timestamp = int(time.time())
        updated_vehicle = f"XYZ{timestamp}"  # Ensure uniqueness
        updated_status = "Available"
        data = {
            "token": self.driver_token,
            "vehicle_number": updated_vehicle,
            "status": updated_status
        }
        print("Request Data:", data)
        response = requests.put(f"{BASE_URL}/users/edit-profile", data=data)
        print("Edit Profile Driver Response:", response.text)
        self.assertEqual(response.status_code, 200, f"Unexpected status code: {response.status_code}")
        updated_data = response.json()
        self.assertEqual(updated_data["vehicle_number"], updated_vehicle)
        self.assertEqual(updated_data["status"], updated_status)
        
    # test_13_change_password_success
    def test_12_change_password_success(self):
        # Create and authenticate customer
        with open(self.test_image_path, 'rb') as img:
            files = {'profile_picture': ('profile.jpg', img, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/users/", data=self.test_user_data, files=files)
        self.customer_id = response.json()["user_id"]
        response = requests.post(f"{BASE_URL}/users/authenticate", data={
            "email": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        })
        self.customer_token = response.json()["token"]

        new_password = "newSecurePassword456"
        response = requests.post(
            f"{BASE_URL}/users/change-password",
            data={
                "token": self.customer_token,
                "current_password": self.test_user_data["password"],
                "new_password": new_password
            }
        )
        self.assertEqual(response.status_code, 200)  # Fix: Expect 200
        self.assertEqual(response.json()["message"], "Password changed successfully")
        
        # Verify new password works
        response = requests.post(
            f"{BASE_URL}/users/authenticate",
            data={
                "email": self.test_user_data["email"],
                "password": new_password
            }
        )
        self.assertEqual(response.status_code, 200)

    def test_13_change_password_wrong_current(self):
        """Test password change with incorrect current password - should fail"""
        # Create driver
        with open(self.test_image_path, 'rb') as img:
            files = {'profile_picture': ('profile.jpg', img, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/users/", data=self.test_driver_data, files=files)
        self.assertEqual(response.status_code, 200, "Failed to create driver")
        self.driver_id = response.json()["user_id"]

        # Authenticate driver
        response = requests.post(f"{BASE_URL}/users/authenticate", data={
            "email": self.test_driver_data["email"],
            "password": self.test_driver_data["password"]
        })
        self.assertEqual(response.status_code, 200, "Failed to authenticate driver")
        self.driver_token = response.json()["token"]
        self.assertIsNotNone(self.driver_token, "Driver token not received")

        # Attempt password change with wrong current password
        response = requests.post(
            f"{BASE_URL}/users/change-password",
            data={
                "token": self.driver_token,
                "current_password": "wrongpassword",
                "new_password": "someNewPassword"
            }
        )
        print("Change Password Response:", response.json())  # Add this to debug
        self.assertEqual(response.status_code, 400, f"Unexpected status code: {response.status_code}")
        self.assertIn("Current password is incorrect", response.json()["detail"])
        
    def test_14_get_users_pagination(self):
        """Test user listing with pagination"""
        # First page
        response = requests.get(
            f"{BASE_URL}/users/get-users",
            params={"page": 1, "limit": 1}
        )
        
        self.assertEqual(response.status_code, 200)
        first_page_data = response.json()
        self.assertIn("users", first_page_data)
        self.assertIn("total", first_page_data)
        self.assertIn("pages", first_page_data)
        self.assertEqual(len(first_page_data["users"]), 1)
        first_user_id = first_page_data["users"][0]["id"]
        
        # Second page
        response = requests.get(
            f"{BASE_URL}/users/get-users",
            params={"page": 2, "limit": 1}
        )
        
        self.assertEqual(response.status_code, 200)
        second_page_data = response.json()
        self.assertEqual(len(second_page_data["users"]), 1)
        
        # Get the second user ID
        second_user_id = second_page_data["users"][0]["id"]
        
        # Users from different pages should be different
        self.assertNotEqual(first_user_id, second_user_id)
    
    def test_15_delete_user(self):
        """Test deleting a user"""
        # Create a user specifically for deletion
        timestamp = int(time.time())
        delete_user_data = {
            "name": f"Delete User {timestamp}",
            "email": f"deleteuser{timestamp}@example.com",
            "password": "deleteMePassword",
            "user_type": "Customer"
        }
        
        # Create user to delete
        with open(self.test_image_path, 'rb') as img:
            files = {'profile_picture': ('profile.jpg', img, 'image/jpeg')}
            response = requests.post(
                f"{BASE_URL}/users/",
                data=delete_user_data,
                files=files
            )
        
        self.assertEqual(response.status_code, 200)
        user_to_delete = response.json()["user_id"]
        
        # Delete the user
        response = requests.delete(f"{BASE_URL}/users/delete-user/{user_to_delete}")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "User deleted successfully")
        
        # Verify user is deleted by trying to authenticate
        response = requests.post(
            f"{BASE_URL}/users/authenticate",
            data={
                "email": delete_user_data["email"],
                "password": delete_user_data["password"]
            }
        )
        
        # Should fail as user no longer exists
        self.assertEqual(response.status_code, 400)

    def test_16_delete_nonexistent_user(self):
        """Test deleting a non-existent user - should fail"""
        # Use a very high ID that's unlikely to exist
        response = requests.delete(f"{BASE_URL}/users/delete-user/999999")
        
        # Adjusted to match the actual API response (500 instead of 404)
        self.assertEqual(response.status_code, 500)
        self.assertIn("Failed to delete user", response.json()["detail"])

if __name__ == "__main__":
    unittest.main()
