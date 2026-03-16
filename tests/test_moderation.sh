#!/bin/bash

BASE_URL="http://localhost:9090/api"
COOKIE_JAR="cookies_report.txt"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}   Lost & Found - Report Test Suite     ${NC}"
echo -e "${YELLOW}========================================${NC}\n"

# ─── 1. Login as regular user ─────────────────────────────────────────────────
echo -e "${YELLOW}[1] Login as regular user${NC}"
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@email.com", "password": "password123"}' \
  -c "$COOKIE_JAR" -b "$COOKIE_JAR")

ACCESS_TOKEN=$(echo "$LOGIN_RES" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo "$LOGIN_RES" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✓ Login passed${NC}\n"
else
  echo -e "${RED}✗ Login failed — cannot proceed${NC}\n"
  exit 1
fi

# ─── 2. Seed a target post via API ───────────────────────────────────────────
echo -e "${YELLOW}[2] Seeding a test post via API${NC}"
SEED_RES=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Lost",
    "category": "Electronics",
    "title": "Report Test Post",
    "description": "Test",
    "location": "Test",
    "item_datetime": "2024-01-01T00:00:00Z"
  }')

POST_ID=$(echo "$SEED_RES" | grep -o '"postId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$POST_ID" ]; then
  echo -e "${GREEN}✓ Test post seeded (ID: $POST_ID)${NC}\n"
else
  echo -e "${RED}✗ Failed to seed test post — cannot proceed${NC}"
  echo "Response: $SEED_RES"
  rm -f "$COOKIE_JAR"
  exit 1
fi

# ─── 3. Submit a report ───────────────────────────────────────────────────────
echo -e "${YELLOW}[3] POST /reports${NC}"
REPORT_RES=$(curl -s -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"target_type\": \"post\",
    \"target_id\": \"$POST_ID\",
    \"category_id\": 1,
    \"reason\": \"This post looks like spam\"
  }")
echo "Response: $REPORT_RES"

REPORT_ID=$(echo "$REPORT_RES" | grep -o '"reportId":"[^"]*"' | cut -d'"' -f4)

if echo "$REPORT_RES" | grep -q "Report submitted"; then
  echo -e "${GREEN}✓ Submit report passed (ID: $REPORT_ID)${NC}\n"
else
  echo -e "${RED}✗ Submit report failed${NC}\n"
fi

# ─── 4. Submit report with missing fields (should fail) ───────────────────────
echo -e "${YELLOW}[4] POST /reports with missing fields (should fail)${NC}"
INVALID_RES=$(curl -s -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_type": "post"}')
echo "Response: $INVALID_RES"

if echo "$INVALID_RES" | grep -q "Missing required fields"; then
  echo -e "${GREEN}✓ Missing fields correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Missing fields should have been rejected${NC}\n"
fi

# ─── 5. Access admin routes as regular user (should fail) ────────────────────
echo -e "${YELLOW}[5] GET /admin/reports as regular user (should fail)${NC}"
UNAUTH_RES=$(curl -s -X GET "$BASE_URL/admin/reports" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $UNAUTH_RES"

if echo "$UNAUTH_RES" | grep -q "403\|Admin access required\|admin is required"; then
  echo -e "${GREEN}✓ Non-admin correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Non-admin should have been rejected${NC}\n"
fi

# ─── 6. Register admin user, promote via API, then login ─────────────────────
echo -e "${YELLOW}[6] Seeding admin user and logging in${NC}"

# Login as admin
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gmail.com", "password": "adminpassword123"}')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✓ Admin login passed${NC}\n"
else
  echo -e "${RED}✗ Admin login failed${NC}"
  echo "Promote response: $PROMOTE_RES"
  echo "Login response: $ADMIN_LOGIN"
fi

# ─── 7. Get all pending reports (admin) ──────────────────────────────────────
echo -e "${YELLOW}[7] GET /admin/reports (admin)${NC}"
GET_REPORTS=$(curl -s -X GET "$BASE_URL/admin/reports" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Response: $GET_REPORTS"

if echo "$GET_REPORTS" | grep -q "spam\|reporter_name"; then
  echo -e "${GREEN}✓ Get reports passed${NC}\n"
else
  echo -e "${RED}✗ Get reports failed${NC}\n"
fi

# ─── 8. Resolve report (admin) ───────────────────────────────────────────────
echo -e "${YELLOW}[8] PUT /admin/reports/:id (resolve)${NC}"
RESOLVE_RES=$(curl -s -X PUT "$BASE_URL/admin/reports/$REPORT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved"}')
echo "Response: $RESOLVE_RES"

if echo "$RESOLVE_RES" | grep -q "resolved"; then
  echo -e "${GREEN}✓ Resolve report passed${NC}\n"
else
  echo -e "${RED}✗ Resolve report failed${NC}\n"
fi

# ─── 9. Invalid status (should fail) ─────────────────────────────────────────
echo -e "${YELLOW}[9] PUT /admin/reports/:id with invalid status (should fail)${NC}"
INVALID_STATUS=$(curl -s -X PUT "$BASE_URL/admin/reports/$REPORT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "banana"}')
echo "Response: $INVALID_STATUS"

if echo "$INVALID_STATUS" | grep -q "Invalid status"; then
  echo -e "${GREEN}✓ Invalid status correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Invalid status should have been rejected${NC}\n"
fi

# ─── Cleanup via API ──────────────────────────────────────────────────────────
curl -s -X DELETE "$BASE_URL/posts/$POST_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null

curl -s -X DELETE "$BASE_URL/admin/users?email=admin@email.com" \
  -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null

rm -f "$COOKIE_JAR"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}         Report Tests Complete          ${NC}"
echo -e "${YELLOW}========================================${NC}"