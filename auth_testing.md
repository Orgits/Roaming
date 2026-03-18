# Auth-Gated App Testing Playbook

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('roamingceo');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  headline: 'Senior Developer at TestCorp',
  summary: 'Experienced professional',
  tier: 'professional',
  city: 'Mumbai',
  industry: 'Technology',
  skills: ['JavaScript', 'React', 'Node.js'],
  experience: [],
  education: [],
  profile_completion: 60,
  status_signals: { open_to_work: false, for_hire: false, seeking_cofounder: false, open_to_investment: false },
  business_profile: null,
  connections_count: 0,
  followers_count: 0,
  influence_score: 50,
  onboarding_complete: true,
  created_at: new Date(),
  updated_at: new Date()
});
db.sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API
```bash
curl -X GET "$NEXT_PUBLIC_BASE_URL/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "$NEXT_PUBLIC_BASE_URL/api/posts" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X POST "$NEXT_PUBLIC_BASE_URL/api/posts" -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_SESSION_TOKEN" -d '{"content": "Test post"}'
```

## Step 3: Browser Testing
```javascript
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "your-app.com",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "sameSite": "None"
}]);
await page.goto("https://your-app.com");
```

## Quick Debug
```bash
mongosh --eval "
use('roamingceo');
db.users.find().limit(2).pretty();
db.sessions.find().limit(2).pretty();
"
```
