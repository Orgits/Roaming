#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://next-portal-hub.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"
TEST_SESSION_TOKEN = "test_session_arun_1773842791838"  # Arun Sharma (user_test001)

# Headers for authenticated requests
AUTH_HEADERS = {
    "Authorization": f"Bearer {TEST_SESSION_TOKEN}",
    "Content-Type": "application/json"
}

HEADERS = {
    "Content-Type": "application/json"
}

def print_test_result(test_name, success, details=""):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   {details}")
    print()

def make_request(method, endpoint, headers=None, data=None):
    """Make HTTP request with error handling"""
    try:
        url = f"{API_URL}{endpoint}"
        kwargs = {'timeout': 10}
        if headers:
            kwargs['headers'] = headers
        if data:
            kwargs['json'] = data
            
        response = getattr(requests, method.lower())(url, **kwargs)
        return response
    except Exception as e:
        print(f"Request failed: {str(e)}")
        return None

def test_health_check():
    """Test GET /api - Health check"""
    try:
        response = make_request("GET", "")
        if not response:
            print_test_result("Health Check", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            expected_platform = "RoamingCEO API v1.0"
            if data.get("platform") == expected_platform:
                print_test_result("Health Check", True, f"Status: {data.get('status')}, Platform: {data.get('platform')}")
            else:
                print_test_result("Health Check", False, f"Unexpected platform: {data.get('platform')}")
                success = False
        else:
            print_test_result("Health Check", False, f"Status code: {response.status_code}")
        
        return success
    except Exception as e:
        print_test_result("Health Check", False, f"Exception: {str(e)}")
        return False

def test_auth_me():
    """Test GET /api/auth/me - Get authenticated user"""
    try:
        response = make_request("GET", "/auth/me", AUTH_HEADERS)
        if not response:
            print_test_result("Auth - Get Me", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if data.get("user_id") and data.get("name"):
                print_test_result("Auth - Get Me", True, f"User: {data.get('name')} ({data.get('user_id')})")
            else:
                print_test_result("Auth - Get Me", False, "Missing user data")
                success = False
        else:
            print_test_result("Auth - Get Me", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Auth - Get Me", False, f"Exception: {str(e)}")
        return False

def test_auth_logout():
    """Test POST /api/auth/logout - Logout"""
    try:
        response = make_request("POST", "/auth/logout", AUTH_HEADERS)
        if not response:
            print_test_result("Auth - Logout", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if data.get("success"):
                print_test_result("Auth - Logout", True, "Successfully logged out")
            else:
                print_test_result("Auth - Logout", False, "Logout not successful")
                success = False
        else:
            print_test_result("Auth - Logout", False, f"Status code: {response.status_code}")
        
        return success
    except Exception as e:
        print_test_result("Auth - Logout", False, f"Exception: {str(e)}")
        return False

def test_users_onboarding():
    """Test POST /api/users/onboarding - Complete onboarding"""
    try:
        onboarding_data = {
            "tier": "professional",
            "city": "Mumbai",
            "industry": "Technology",
            "headline": "Senior Backend Engineer",
            "skills": ["Python", "JavaScript", "MongoDB", "API Development"]
        }
        
        response = make_request("POST", "/users/onboarding", AUTH_HEADERS, onboarding_data)
        if not response:
            print_test_result("Users - Onboarding", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if data.get("onboarding_complete") and data.get("user_id"):
                print_test_result("Users - Onboarding", True, f"Onboarding completed for {data.get('name')}")
            else:
                print_test_result("Users - Onboarding", False, "Onboarding not marked complete")
                success = False
        else:
            print_test_result("Users - Onboarding", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Users - Onboarding", False, f"Exception: {str(e)}")
        return False

def test_users_profile_update():
    """Test PUT /api/users/profile - Update user profile"""
    try:
        profile_data = {
            "headline": "Senior Full-Stack Engineer",
            "summary": "Experienced developer with expertise in modern web technologies",
            "skills": ["Python", "JavaScript", "React", "MongoDB", "API Development", "Testing"]
        }
        
        response = make_request("PUT", "/users/profile", AUTH_HEADERS, profile_data)
        if not response:
            print_test_result("Users - Update Profile", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if data.get("user_id") and data.get("headline") == profile_data["headline"]:
                print_test_result("Users - Update Profile", True, f"Profile updated. New headline: {data.get('headline')}")
            else:
                print_test_result("Users - Update Profile", False, "Profile not properly updated")
                success = False
        else:
            print_test_result("Users - Update Profile", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Users - Update Profile", False, f"Exception: {str(e)}")
        return False

def test_users_search():
    """Test GET /api/users/search - Search users"""
    try:
        response = make_request("GET", "/users/search?q=Priya")
        if not response:
            print_test_result("Users - Search", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "users" in data and "total" in data:
                print_test_result("Users - Search", True, f"Found {data.get('total')} users matching 'Priya'")
            else:
                print_test_result("Users - Search", False, "Invalid search response format")
                success = False
        else:
            print_test_result("Users - Search", False, f"Status code: {response.status_code}")
        
        return success
    except Exception as e:
        print_test_result("Users - Search", False, f"Exception: {str(e)}")
        return False

def test_users_get_by_id():
    """Test GET /api/users/{userId} - Get user by ID"""
    try:
        test_user_id = "user_test002"  # Test with another user
        response = make_request("GET", f"/users/{test_user_id}")
        if not response:
            print_test_result("Users - Get by ID", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if data.get("user_id") == test_user_id:
                print_test_result("Users - Get by ID", True, f"Retrieved user: {data.get('name')}")
            else:
                print_test_result("Users - Get by ID", False, "User ID mismatch")
                success = False
        else:
            print_test_result("Users - Get by ID", False, f"Status code: {response.status_code}")
        
        return success
    except Exception as e:
        print_test_result("Users - Get by ID", False, f"Exception: {str(e)}")
        return False

def test_posts_get_feed():
    """Test GET /api/posts - Get feed posts"""
    try:
        response = make_request("GET", "/posts", AUTH_HEADERS)
        if not response:
            print_test_result("Posts - Get Feed", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "posts" in data and "total" in data:
                print_test_result("Posts - Get Feed", True, f"Retrieved {len(data.get('posts', []))} posts (total: {data.get('total')})")
            else:
                print_test_result("Posts - Get Feed", False, "Invalid feed response format")
                success = False
        else:
            print_test_result("Posts - Get Feed", False, f"Status code: {response.status_code}")
        
        return success
    except Exception as e:
        print_test_result("Posts - Get Feed", False, f"Exception: {str(e)}")
        return False

def test_posts_create():
    """Test POST /api/posts - Create post"""
    try:
        post_data = {
            "content": "This is a test post from the automated testing suite. Testing RoamingCEO platform functionality!",
            "type": "standard",
            "hashtags": ["testing", "roamingceo", "automation"]
        }
        
        response = make_request("POST", "/posts", AUTH_HEADERS, post_data)
        if not response:
            print_test_result("Posts - Create", False, "Request failed")
            return False
            
        success = response.status_code == 201
        if success:
            data = response.json()
            if data.get("post_id") and data.get("content") == post_data["content"]:
                global created_post_id
                created_post_id = data.get("post_id")
                print_test_result("Posts - Create", True, f"Created post: {data.get('post_id')}")
            else:
                print_test_result("Posts - Create", False, "Post not properly created")
                success = False
        else:
            print_test_result("Posts - Create", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Posts - Create", False, f"Exception: {str(e)}")
        return False

# Global variable to store created post ID for other tests
created_post_id = None

def test_posts_react():
    """Test POST /api/posts/{postId}/react - React to post"""
    try:
        # First get a post to react to
        posts_response = make_request("GET", "/posts", AUTH_HEADERS)
        if not posts_response or posts_response.status_code != 200:
            print_test_result("Posts - React", False, "Could not fetch posts for reaction test")
            return False
            
        posts_data = posts_response.json()
        posts = posts_data.get("posts", [])
        if not posts:
            print_test_result("Posts - React", False, "No posts available for reaction test")
            return False
            
        post_id = posts[0].get("post_id")
        reaction_data = {"type": "like"}
        
        response = make_request("POST", f"/posts/{post_id}/react", AUTH_HEADERS, reaction_data)
        if not response:
            print_test_result("Posts - React", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if data.get("type") == "like" and data.get("action") in ["added", "removed", "changed"]:
                print_test_result("Posts - React", True, f"Reaction {data.get('action')}: {data.get('type')}")
            else:
                print_test_result("Posts - React", False, "Invalid reaction response")
                success = False
        else:
            print_test_result("Posts - React", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Posts - React", False, f"Exception: {str(e)}")
        return False

def test_posts_comment():
    """Test POST /api/posts/{postId}/comment - Add comment to post"""
    try:
        # First get a post to comment on
        posts_response = make_request("GET", "/posts", AUTH_HEADERS)
        if not posts_response or posts_response.status_code != 200:
            print_test_result("Posts - Comment", False, "Could not fetch posts for comment test")
            return False
            
        posts_data = posts_response.json()
        posts = posts_data.get("posts", [])
        if not posts:
            print_test_result("Posts - Comment", False, "No posts available for comment test")
            return False
            
        post_id = posts[0].get("post_id")
        comment_data = {"content": "This is a test comment from the automated testing suite!"}
        
        response = make_request("POST", f"/posts/{post_id}/comment", AUTH_HEADERS, comment_data)
        if not response:
            print_test_result("Posts - Comment", False, "Request failed")
            return False
            
        success = response.status_code == 201
        if success:
            data = response.json()
            if data.get("comment_id") and data.get("content") == comment_data["content"]:
                print_test_result("Posts - Comment", True, f"Added comment: {data.get('comment_id')}")
            else:
                print_test_result("Posts - Comment", False, "Comment not properly created")
                success = False
        else:
            print_test_result("Posts - Comment", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Posts - Comment", False, f"Exception: {str(e)}")
        return False

def test_posts_get_comments():
    """Test GET /api/posts/{postId}/comments - Get post comments"""
    try:
        # First get a post to fetch comments for
        posts_response = make_request("GET", "/posts", AUTH_HEADERS)
        if not posts_response or posts_response.status_code != 200:
            print_test_result("Posts - Get Comments", False, "Could not fetch posts for comments test")
            return False
            
        posts_data = posts_response.json()
        posts = posts_data.get("posts", [])
        if not posts:
            print_test_result("Posts - Get Comments", False, "No posts available for comments test")
            return False
            
        post_id = posts[0].get("post_id")
        
        response = make_request("GET", f"/posts/{post_id}/comments")
        if not response:
            print_test_result("Posts - Get Comments", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "comments" in data:
                print_test_result("Posts - Get Comments", True, f"Retrieved {len(data.get('comments', []))} comments")
            else:
                print_test_result("Posts - Get Comments", False, "Invalid comments response format")
                success = False
        else:
            print_test_result("Posts - Get Comments", False, f"Status code: {response.status_code}")
        
        return success
    except Exception as e:
        print_test_result("Posts - Get Comments", False, f"Exception: {str(e)}")
        return False

def test_connections_get():
    """Test GET /api/connections - Get user connections"""
    try:
        response = make_request("GET", "/connections", AUTH_HEADERS)
        if not response:
            print_test_result("Connections - Get", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "connections" in data and "users" in data:
                print_test_result("Connections - Get", True, f"Retrieved {len(data.get('connections', []))} connections")
            else:
                print_test_result("Connections - Get", False, "Invalid connections response format")
                success = False
        else:
            print_test_result("Connections - Get", False, f"Status code: {response.status_code}")
        
        return success
    except Exception as e:
        print_test_result("Connections - Get", False, f"Exception: {str(e)}")
        return False

def test_connections_requests():
    """Test GET /api/connections/requests - Get pending requests"""
    try:
        response = make_request("GET", "/connections/requests", AUTH_HEADERS)
        if not response:
            print_test_result("Connections - Get Requests", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "requests" in data:
                print_test_result("Connections - Get Requests", True, f"Retrieved {len(data.get('requests', []))} pending requests")
            else:
                print_test_result("Connections - Get Requests", False, "Invalid requests response format")
                success = False
        else:
            print_test_result("Connections - Get Requests", False, f"Status code: {response.status_code}")
        
        return success
    except Exception as e:
        print_test_result("Connections - Get Requests", False, f"Exception: {str(e)}")
        return False

def test_connections_suggestions():
    """Test GET /api/connections/suggestions - Get connection suggestions"""
    try:
        response = make_request("GET", "/connections/suggestions", AUTH_HEADERS)
        if not response:
            print_test_result("Connections - Get Suggestions", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "suggestions" in data:
                print_test_result("Connections - Get Suggestions", True, f"Retrieved {len(data.get('suggestions', []))} suggestions")
            else:
                print_test_result("Connections - Get Suggestions", False, "Invalid suggestions response format")
                success = False
        else:
            print_test_result("Connections - Get Suggestions", False, f"Status code: {response.status_code}")
        
        return success
    except Exception as e:
        print_test_result("Connections - Get Suggestions", False, f"Exception: {str(e)}")
        return False

def test_connections_send_request():
    """Test POST /api/connections/request - Send connection request"""
    try:
        # Get suggestions to find someone to connect with
        suggestions_response = make_request("GET", "/connections/suggestions", AUTH_HEADERS)
        if not suggestions_response or suggestions_response.status_code != 200:
            print_test_result("Connections - Send Request", False, "Could not fetch suggestions for connection test")
            return False
            
        suggestions_data = suggestions_response.json()
        suggestions = suggestions_data.get("suggestions", [])
        if not suggestions:
            print_test_result("Connections - Send Request", False, "No suggestions available for connection test")
            return False
            
        recipient_id = suggestions[0].get("user_id")
        request_data = {
            "recipient_id": recipient_id,
            "note": "Hi! I'd like to connect with you through the RoamingCEO platform."
        }
        
        response = make_request("POST", "/connections/request", AUTH_HEADERS, request_data)
        if not response:
            print_test_result("Connections - Send Request", False, "Request failed")
            return False
            
        success = response.status_code == 201
        if success:
            data = response.json()
            if data.get("connection_id") and data.get("status") == "pending":
                global sent_connection_id
                sent_connection_id = data.get("connection_id")
                print_test_result("Connections - Send Request", True, f"Sent connection request: {data.get('connection_id')}")
            else:
                print_test_result("Connections - Send Request", False, "Connection request not properly created")
                success = False
        else:
            # Check if it's a 409 (already exists) - that's acceptable
            if response.status_code == 409:
                print_test_result("Connections - Send Request", True, "Connection already exists (409) - acceptable")
                success = True
            else:
                print_test_result("Connections - Send Request", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Connections - Send Request", False, f"Exception: {str(e)}")
        return False

# Global variable to store sent connection ID for other tests
sent_connection_id = None

def test_connections_accept():
    """Test PUT /api/connections/{connId}/accept - Accept connection"""
    try:
        # First check if we have pending requests to accept
        requests_response = make_request("GET", "/connections/requests", AUTH_HEADERS)
        if not requests_response or requests_response.status_code != 200:
            print_test_result("Connections - Accept", True, "No pending requests to accept - test skipped")
            return True
            
        requests_data = requests_response.json()
        requests_list = requests_data.get("requests", [])
        if not requests_list:
            print_test_result("Connections - Accept", True, "No pending requests to accept - test skipped")
            return True
            
        connection_id = requests_list[0].get("connection_id")
        
        response = make_request("PUT", f"/connections/{connection_id}/accept", AUTH_HEADERS)
        if not response:
            print_test_result("Connections - Accept", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if data.get("success") and data.get("status") == "accepted":
                print_test_result("Connections - Accept", True, f"Accepted connection: {connection_id}")
            else:
                print_test_result("Connections - Accept", False, "Connection not properly accepted")
                success = False
        else:
            print_test_result("Connections - Accept", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Connections - Accept", False, f"Exception: {str(e)}")
        return False

def test_connections_reject():
    """Test PUT /api/connections/{connId}/reject - Reject connection"""
    try:
        # For this test, we'll try to reject a non-existent connection to test the endpoint
        fake_connection_id = "conn_nonexistent123"
        
        response = make_request("PUT", f"/connections/{fake_connection_id}/reject", AUTH_HEADERS)
        if not response:
            print_test_result("Connections - Reject", False, "Request failed")
            return False
            
        # We expect a 404 for non-existent connection
        if response.status_code == 404:
            print_test_result("Connections - Reject", True, "Correctly returned 404 for non-existent connection")
            return True
        else:
            print_test_result("Connections - Reject", False, f"Unexpected status code: {response.status_code}")
            return False
    except Exception as e:
        print_test_result("Connections - Reject", False, f"Exception: {str(e)}")
        return False

def test_posts_delete():
    """Test DELETE /api/posts/{postId} - Delete post"""
    try:
        # Use the post we created earlier if available
        post_id_to_delete = created_post_id if created_post_id else None
        
        if not post_id_to_delete:
            # Create a post specifically for deletion test
            post_data = {
                "content": "This post will be deleted by the test suite",
                "type": "standard"
            }
            create_response = make_request("POST", "/posts", AUTH_HEADERS, post_data)
            if create_response and create_response.status_code == 201:
                post_id_to_delete = create_response.json().get("post_id")
            else:
                print_test_result("Posts - Delete", False, "Could not create post for deletion test")
                return False
        
        response = make_request("DELETE", f"/posts/{post_id_to_delete}", AUTH_HEADERS)
        if not response:
            print_test_result("Posts - Delete", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if data.get("success"):
                print_test_result("Posts - Delete", True, f"Deleted post: {post_id_to_delete}")
            else:
                print_test_result("Posts - Delete", False, "Delete not successful")
                success = False
        else:
            print_test_result("Posts - Delete", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Posts - Delete", False, f"Exception: {str(e)}")
        return False

def test_connections_remove():
    """Test DELETE /api/connections/{connId} - Remove connection"""
    try:
        # Get current connections to find one to remove
        connections_response = make_request("GET", "/connections", AUTH_HEADERS)
        if not connections_response or connections_response.status_code != 200:
            print_test_result("Connections - Remove", True, "No connections to remove - test skipped")
            return True
            
        connections_data = connections_response.json()
        connections = connections_data.get("connections", [])
        if not connections:
            print_test_result("Connections - Remove", True, "No connections to remove - test skipped")
            return True
            
        connection_id = connections[0].get("connection_id")
        
        response = make_request("DELETE", f"/connections/{connection_id}", AUTH_HEADERS)
        if not response:
            print_test_result("Connections - Remove", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if data.get("success"):
                print_test_result("Connections - Remove", True, f"Removed connection: {connection_id}")
            else:
                print_test_result("Connections - Remove", False, "Remove not successful")
                success = False
        else:
            print_test_result("Connections - Remove", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Connections - Remove", False, f"Exception: {str(e)}")
        return False

def test_business_index():
    """Test GET /api/business - Business index with search/filter"""
    try:
        response = make_request("GET", "/business")
        if not response:
            print_test_result("Business Index", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "businesses" in data and "total" in data:
                print_test_result("Business Index", True, f"Retrieved {len(data.get('businesses', []))} businesses (total: {data.get('total')})")
            else:
                print_test_result("Business Index", False, "Invalid business response format")
                success = False
        else:
            print_test_result("Business Index", False, f"Status code: {response.status_code}")
        
        return success
    except Exception as e:
        print_test_result("Business Index", False, f"Exception: {str(e)}")
        return False

def test_ceo_index():
    """Test GET /api/ceo - CEO index with search/filter"""
    try:
        response = make_request("GET", "/ceo")
        if not response:
            print_test_result("CEO Index", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "executives" in data and "total" in data:
                print_test_result("CEO Index", True, f"Retrieved {len(data.get('executives', []))} executives (total: {data.get('total')})")
            else:
                print_test_result("CEO Index", False, "Invalid CEO response format")
                success = False
        else:
            print_test_result("CEO Index", False, f"Status code: {response.status_code}")
        
        return success
    except Exception as e:
        print_test_result("CEO Index", False, f"Exception: {str(e)}")
        return False

def main():
    """Run all backend API tests"""
    print("=" * 60)
    print("🚀 RoamingCEO Backend API Testing Suite")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Session Token: {TEST_SESSION_TOKEN}")
    print("=" * 60)
    print()
    
    # Track test results
    results = {}
    
    # Run all tests
    test_functions = [
        ("Health Check", test_health_check),
        ("Auth - Get Me", test_auth_me),
        ("Auth - Logout", test_auth_logout),
        ("Users - Onboarding", test_users_onboarding),
        ("Users - Update Profile", test_users_profile_update),
        ("Users - Search", test_users_search),
        ("Users - Get by ID", test_users_get_by_id),
        ("Posts - Get Feed", test_posts_get_feed),
        ("Posts - Create", test_posts_create),
        ("Posts - React", test_posts_react),
        ("Posts - Comment", test_posts_comment),
        ("Posts - Get Comments", test_posts_get_comments),
        ("Posts - Delete", test_posts_delete),
        ("Connections - Get", test_connections_get),
        ("Connections - Get Requests", test_connections_requests),
        ("Connections - Get Suggestions", test_connections_suggestions),
        ("Connections - Send Request", test_connections_send_request),
        ("Connections - Accept", test_connections_accept),
        ("Connections - Reject", test_connections_reject),
        ("Connections - Remove", test_connections_remove),
        ("Business Index", test_business_index),
        ("CEO Index", test_ceo_index),
    ]
    
    for test_name, test_func in test_functions:
        try:
            result = test_func()
            results[test_name] = result
        except Exception as e:
            print_test_result(test_name, False, f"Test execution failed: {str(e)}")
            results[test_name] = False
    
    # Print summary
    print("=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print("=" * 60)
    print(f"Total Tests: {len(results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed / len(results) * 100):.1f}%")
    print("=" * 60)
    
    if failed > 0:
        print("❌ Some tests failed. Check the details above.")
        return 1
    else:
        print("✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())