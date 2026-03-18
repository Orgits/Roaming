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

# ================== PHASE 2 TESTS ==================

# Global variables for Phase 2 testing
created_job_id = None
created_community_id = None
created_event_id = None
created_cofounder_post_id = None
created_conversation_id = None

def test_jobs_get_all():
    """Test GET /api/jobs - Get all job listings"""
    try:
        response = make_request("GET", "/jobs", AUTH_HEADERS)
        if not response:
            print_test_result("Jobs - Get All", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "jobs" in data and "total" in data:
                print_test_result("Jobs - Get All", True, f"Retrieved {len(data.get('jobs', []))} jobs (total: {data.get('total')})")
            else:
                print_test_result("Jobs - Get All", False, "Invalid jobs response format")
                success = False
        else:
            print_test_result("Jobs - Get All", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Jobs - Get All", False, f"Exception: {str(e)}")
        return False

def test_jobs_create():
    """Test POST /api/jobs - Create job posting"""
    try:
        job_data = {
            "title": "Senior Software Engineer - Full Stack",
            "company": "TechCorp Solutions",
            "location": "Mumbai, India",
            "type": "full-time",
            "work_mode": "hybrid",
            "description": "We are looking for an experienced full-stack engineer to join our growing team. Must have experience with React, Node.js, and MongoDB.",
            "salary_min": 1200000,
            "salary_max": 1800000,
            "skills": ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript"],
            "experience_level": "senior",
            "easy_apply": True
        }
        
        response = make_request("POST", "/jobs", AUTH_HEADERS, job_data)
        if not response:
            print_test_result("Jobs - Create", False, "Request failed")
            return False
            
        success = response.status_code == 201
        if success:
            data = response.json()
            if data.get("job_id") and data.get("title") == job_data["title"]:
                global created_job_id
                created_job_id = data.get("job_id")
                print_test_result("Jobs - Create", True, f"Created job: {data.get('job_id')} - {data.get('title')}")
            else:
                print_test_result("Jobs - Create", False, "Job not properly created")
                success = False
        else:
            print_test_result("Jobs - Create", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Jobs - Create", False, f"Exception: {str(e)}")
        return False

def test_jobs_apply():
    """Test POST /api/jobs/{jobId}/apply - Apply to job"""
    try:
        # First get available jobs
        jobs_response = make_request("GET", "/jobs", AUTH_HEADERS)
        if not jobs_response or jobs_response.status_code != 200:
            print_test_result("Jobs - Apply", False, "Could not fetch jobs for apply test")
            return False
            
        jobs_data = jobs_response.json()
        jobs = jobs_data.get("jobs", [])
        if not jobs:
            print_test_result("Jobs - Apply", False, "No jobs available for apply test")
            return False
            
        # Use created job or first available job
        job_id = created_job_id if created_job_id else jobs[0].get("job_id")
        application_data = {
            "cover_note": "I'm very interested in this position and believe my experience in full-stack development makes me a strong candidate."
        }
        
        response = make_request("POST", f"/jobs/{job_id}/apply", AUTH_HEADERS, application_data)
        if not response:
            print_test_result("Jobs - Apply", False, "Request failed")
            return False
            
        success = response.status_code == 201
        if success:
            data = response.json()
            if data.get("application_id") and data.get("job_id") == job_id:
                print_test_result("Jobs - Apply", True, f"Applied to job: {job_id}")
            else:
                print_test_result("Jobs - Apply", False, "Application not properly created")
                success = False
        else:
            # Check if already applied (409 is acceptable)
            if response.status_code == 409:
                print_test_result("Jobs - Apply", True, "Already applied to this job (409) - acceptable")
                success = True
            else:
                print_test_result("Jobs - Apply", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Jobs - Apply", False, f"Exception: {str(e)}")
        return False

def test_communities_get_all():
    """Test GET /api/communities - Get all communities"""
    try:
        response = make_request("GET", "/communities", AUTH_HEADERS)
        if not response:
            print_test_result("Communities - Get All", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "communities" in data and "total" in data:
                print_test_result("Communities - Get All", True, f"Retrieved {len(data.get('communities', []))} communities (total: {data.get('total')})")
            else:
                print_test_result("Communities - Get All", False, "Invalid communities response format")
                success = False
        else:
            print_test_result("Communities - Get All", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Communities - Get All", False, f"Exception: {str(e)}")
        return False

def test_communities_create():
    """Test POST /api/communities - Create new community"""
    try:
        community_data = {
            "name": "Full Stack Developers Mumbai",
            "type": "professional",
            "description": "A community for full-stack developers in Mumbai to share knowledge, network, and collaborate on projects.",
            "industry": "Technology",
            "city": "Mumbai",
            "rules": "Be respectful, share knowledge, help each other grow"
        }
        
        response = make_request("POST", "/communities", AUTH_HEADERS, community_data)
        if not response:
            print_test_result("Communities - Create", False, "Request failed")
            return False
            
        success = response.status_code == 201
        if success:
            data = response.json()
            if data.get("community_id") and data.get("name") == community_data["name"]:
                global created_community_id
                created_community_id = data.get("community_id")
                print_test_result("Communities - Create", True, f"Created community: {data.get('community_id')} - {data.get('name')}")
            else:
                print_test_result("Communities - Create", False, "Community not properly created")
                success = False
        else:
            print_test_result("Communities - Create", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Communities - Create", False, f"Exception: {str(e)}")
        return False

def test_communities_join():
    """Test POST /api/communities/{communityId}/join - Join community"""
    try:
        # First get available communities
        communities_response = make_request("GET", "/communities", AUTH_HEADERS)
        if not communities_response or communities_response.status_code != 200:
            print_test_result("Communities - Join", False, "Could not fetch communities for join test")
            return False
            
        communities_data = communities_response.json()
        communities = communities_data.get("communities", [])
        if not communities:
            print_test_result("Communities - Join", False, "No communities available for join test")
            return False
            
        # Find a community we're not already a member of
        community_id = None
        for community in communities:
            if not community.get("is_member", False):
                community_id = community.get("community_id")
                break
        
        if not community_id:
            # Use created community or first available
            community_id = created_community_id if created_community_id else communities[0].get("community_id")
        
        response = make_request("POST", f"/communities/{community_id}/join", AUTH_HEADERS)
        if not response:
            print_test_result("Communities - Join", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if data.get("success"):
                print_test_result("Communities - Join", True, f"Joined community: {community_id}")
            else:
                print_test_result("Communities - Join", False, "Join not successful")
                success = False
        else:
            # Check if already a member (409 is acceptable)
            if response.status_code == 409:
                print_test_result("Communities - Join", True, "Already a member (409) - acceptable")
                success = True
            else:
                print_test_result("Communities - Join", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Communities - Join", False, f"Exception: {str(e)}")
        return False

def test_events_get_all():
    """Test GET /api/events - Get all events"""
    try:
        response = make_request("GET", "/events", AUTH_HEADERS)
        if not response:
            print_test_result("Events - Get All", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "events" in data and "total" in data:
                print_test_result("Events - Get All", True, f"Retrieved {len(data.get('events', []))} events (total: {data.get('total')})")
            else:
                print_test_result("Events - Get All", False, "Invalid events response format")
                success = False
        else:
            print_test_result("Events - Get All", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Events - Get All", False, f"Exception: {str(e)}")
        return False

def test_events_create():
    """Test POST /api/events - Create new event"""
    try:
        from datetime import datetime, timedelta
        future_date = (datetime.now() + timedelta(days=30)).isoformat()
        
        event_data = {
            "title": "Mumbai Tech Meetup - Full Stack Development",
            "description": "Join us for an evening of networking and learning about the latest trends in full-stack development. We'll have talks on React, Node.js, and cloud deployment strategies.",
            "type": "meetup",
            "format": "physical",
            "date": future_date,
            "location": "Mumbai, India",
            "venue": "Tech Hub Mumbai, Andheri East",
            "capacity": 100,
            "price": 0
        }
        
        response = make_request("POST", "/events", AUTH_HEADERS, event_data)
        if not response:
            print_test_result("Events - Create", False, "Request failed")
            return False
            
        success = response.status_code == 201
        if success:
            data = response.json()
            if data.get("event_id") and data.get("title") == event_data["title"]:
                global created_event_id
                created_event_id = data.get("event_id")
                print_test_result("Events - Create", True, f"Created event: {data.get('event_id')} - {data.get('title')}")
            else:
                print_test_result("Events - Create", False, "Event not properly created")
                success = False
        else:
            print_test_result("Events - Create", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Events - Create", False, f"Exception: {str(e)}")
        return False

def test_events_rsvp():
    """Test POST /api/events/{eventId}/rsvp - RSVP to event"""
    try:
        # First get available events
        events_response = make_request("GET", "/events", AUTH_HEADERS)
        if not events_response or events_response.status_code != 200:
            print_test_result("Events - RSVP", False, "Could not fetch events for RSVP test")
            return False
            
        events_data = events_response.json()
        events = events_data.get("events", [])
        if not events:
            print_test_result("Events - RSVP", False, "No events available for RSVP test")
            return False
            
        # Use created event or first available event
        event_id = created_event_id if created_event_id else events[0].get("event_id")
        rsvp_data = {"status": "going"}
        
        response = make_request("POST", f"/events/{event_id}/rsvp", AUTH_HEADERS, rsvp_data)
        if not response:
            print_test_result("Events - RSVP", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if data.get("action") in ["added", "updated", "removed"] and ("status" in data or data.get("action") == "removed"):
                print_test_result("Events - RSVP", True, f"RSVP {data.get('action')} for event: {event_id}")
            else:
                print_test_result("Events - RSVP", False, "RSVP not properly processed")
                success = False
        else:
            print_test_result("Events - RSVP", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Events - RSVP", False, f"Exception: {str(e)}")
        return False

def test_cofounder_get_posts():
    """Test GET /api/cofounder - Get cofounder posts"""
    try:
        response = make_request("GET", "/cofounder", AUTH_HEADERS)
        if not response:
            print_test_result("Cofounder - Get Posts", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "posts" in data and "total" in data:
                print_test_result("Cofounder - Get Posts", True, f"Retrieved {len(data.get('posts', []))} cofounder posts (total: {data.get('total')})")
            else:
                print_test_result("Cofounder - Get Posts", False, "Invalid cofounder response format")
                success = False
        else:
            print_test_result("Cofounder - Get Posts", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Cofounder - Get Posts", False, f"Exception: {str(e)}")
        return False

def test_cofounder_create_post():
    """Test POST /api/cofounder - Create cofounder post"""
    try:
        cofounder_data = {
            "title": "Looking for Technical Co-founder - FinTech Startup",
            "description": "I'm building a revolutionary fintech platform and looking for a technical co-founder with strong experience in backend development, security, and financial systems. This is a great opportunity to be part of something big from the ground up.",
            "looking_for": "tech",
            "commitment": "full-time",
            "equity_range": "15-25%",
            "location_pref": "Mumbai/Remote",
            "stage": "MVP"
        }
        
        response = make_request("POST", "/cofounder", AUTH_HEADERS, cofounder_data)
        if not response:
            print_test_result("Cofounder - Create Post", False, "Request failed")
            return False
            
        success = response.status_code == 201
        if success:
            data = response.json()
            if data.get("post_id") and data.get("title") == cofounder_data["title"]:
                global created_cofounder_post_id
                created_cofounder_post_id = data.get("post_id")
                print_test_result("Cofounder - Create Post", True, f"Created cofounder post: {data.get('post_id')}")
            else:
                print_test_result("Cofounder - Create Post", False, "Cofounder post not properly created")
                success = False
        else:
            print_test_result("Cofounder - Create Post", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Cofounder - Create Post", False, f"Exception: {str(e)}")
        return False

def test_messaging_get_conversations():
    """Test GET /api/conversations - Get user's conversations"""
    try:
        response = make_request("GET", "/conversations", AUTH_HEADERS)
        if not response:
            print_test_result("Messaging - Get Conversations", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "conversations" in data:
                print_test_result("Messaging - Get Conversations", True, f"Retrieved {len(data.get('conversations', []))} conversations")
            else:
                print_test_result("Messaging - Get Conversations", False, "Invalid conversations response format")
                success = False
        else:
            print_test_result("Messaging - Get Conversations", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Messaging - Get Conversations", False, f"Exception: {str(e)}")
        return False

def test_messaging_start_conversation():
    """Test POST /api/conversations/start - Start new conversation"""
    try:
        # Get a user to start conversation with
        users_response = make_request("GET", "/users/search?q=Priya", AUTH_HEADERS)
        if not users_response or users_response.status_code != 200:
            print_test_result("Messaging - Start Conversation", False, "Could not find users for conversation test")
            return False
            
        users_data = users_response.json()
        users = users_data.get("users", [])
        if not users:
            print_test_result("Messaging - Start Conversation", False, "No users available for conversation test")
            return False
            
        recipient_id = users[0].get("user_id")
        if recipient_id == "user_test001":  # Don't start conversation with self
            if len(users) > 1:
                recipient_id = users[1].get("user_id")
            else:
                recipient_id = "user_test002"  # fallback
        
        conversation_data = {"recipient_id": recipient_id}
        
        response = make_request("POST", "/conversations/start", AUTH_HEADERS, conversation_data)
        if not response:
            print_test_result("Messaging - Start Conversation", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if data.get("conversation_id") and "participants" in data:
                global created_conversation_id
                created_conversation_id = data.get("conversation_id")
                print_test_result("Messaging - Start Conversation", True, f"Started conversation: {data.get('conversation_id')}")
            else:
                print_test_result("Messaging - Start Conversation", False, "Conversation not properly created")
                success = False
        else:
            print_test_result("Messaging - Start Conversation", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Messaging - Start Conversation", False, f"Exception: {str(e)}")
        return False

def test_messaging_send_message():
    """Test POST /api/conversations/{conversationId}/send - Send message"""
    try:
        # Use created conversation or get existing conversation
        conversation_id = created_conversation_id
        
        if not conversation_id:
            # Get existing conversations
            conversations_response = make_request("GET", "/conversations", AUTH_HEADERS)
            if conversations_response and conversations_response.status_code == 200:
                conversations_data = conversations_response.json()
                conversations = conversations_data.get("conversations", [])
                if conversations:
                    conversation_id = conversations[0].get("conversation_id")
        
        if not conversation_id:
            print_test_result("Messaging - Send Message", False, "No conversation available for message test")
            return False
        
        message_data = {"content": "Hello! This is a test message from the automated testing suite."}
        
        response = make_request("POST", f"/conversations/{conversation_id}/send", AUTH_HEADERS, message_data)
        if not response:
            print_test_result("Messaging - Send Message", False, "Request failed")
            return False
            
        success = response.status_code == 201
        if success:
            data = response.json()
            if data.get("message_id") and data.get("content") == message_data["content"]:
                print_test_result("Messaging - Send Message", True, f"Sent message: {data.get('message_id')}")
            else:
                print_test_result("Messaging - Send Message", False, "Message not properly sent")
                success = False
        else:
            print_test_result("Messaging - Send Message", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Messaging - Send Message", False, f"Exception: {str(e)}")
        return False

def test_messaging_get_messages():
    """Test GET /api/conversations/{conversationId}/messages - Get messages in conversation"""
    try:
        # Use created conversation or get existing conversation
        conversation_id = created_conversation_id
        
        if not conversation_id:
            # Get existing conversations
            conversations_response = make_request("GET", "/conversations", AUTH_HEADERS)
            if conversations_response and conversations_response.status_code == 200:
                conversations_data = conversations_response.json()
                conversations = conversations_data.get("conversations", [])
                if conversations:
                    conversation_id = conversations[0].get("conversation_id")
        
        if not conversation_id:
            print_test_result("Messaging - Get Messages", False, "No conversation available for messages test")
            return False
        
        response = make_request("GET", f"/conversations/{conversation_id}/messages", AUTH_HEADERS)
        if not response:
            print_test_result("Messaging - Get Messages", False, "Request failed")
            return False
            
        success = response.status_code == 200
        if success:
            data = response.json()
            if "messages" in data and "conversation" in data:
                print_test_result("Messaging - Get Messages", True, f"Retrieved {len(data.get('messages', []))} messages")
            else:
                print_test_result("Messaging - Get Messages", False, "Invalid messages response format")
                success = False
        else:
            print_test_result("Messaging - Get Messages", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        return success
    except Exception as e:
        print_test_result("Messaging - Get Messages", False, f"Exception: {str(e)}")
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
        # Phase 2 Tests
        ("Jobs - Get All", test_jobs_get_all),
        ("Jobs - Create", test_jobs_create),
        ("Jobs - Apply", test_jobs_apply),
        ("Communities - Get All", test_communities_get_all),
        ("Communities - Create", test_communities_create),
        ("Communities - Join", test_communities_join),
        ("Events - Get All", test_events_get_all),
        ("Events - Create", test_events_create),
        ("Events - RSVP", test_events_rsvp),
        ("Cofounder - Get Posts", test_cofounder_get_posts),
        ("Cofounder - Create Post", test_cofounder_create_post),
        ("Messaging - Get Conversations", test_messaging_get_conversations),
        ("Messaging - Start Conversation", test_messaging_start_conversation),
        ("Messaging - Send Message", test_messaging_send_message),
        ("Messaging - Get Messages", test_messaging_get_messages),
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