#!/bin/bash

BASE_URL="http://localhost:9090/api"
COOKIE_JAR="cookies_post.txt"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}    Lost & Found - Post Test Suite      ${NC}"
echo -e "${YELLOW}========================================${NC}\n"

# ─── 1. Login ─────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[1] Login to get access token${NC}"
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@email.com", "password": "password123"}' \
  -c "$COOKIE_JAR" -b "$COOKIE_JAR")

ACCESS_TOKEN=$(echo "$LOGIN_RES" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✓ Login passed${NC}\n"
else
  echo -e "${RED}✗ Login failed — cannot proceed${NC}\n"
  exit 1
fi

# ─── 2. Create post ───────────────────────────────────────────────────────────
echo -e "${YELLOW}[2] POST /posts${NC}"
CREATE_RES=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Lost",
    "category": "Electronics",
    "title": "Lost iPhone",
    "description": "Black iPhone 15 lost near library",
    "location": "Central Library",
    "item_datetime": "2026-03-01T10:00:00",
    "contact_info": "0912345678"
  }')
echo "Response: $CREATE_RES"

POST_ID=$(echo "$CREATE_RES" | grep -o '"postId":"[^"]*"' | cut -d'"' -f4)

if echo "$CREATE_RES" | grep -q "Post created successfully"; then
  echo -e "${GREEN}✓ Create post passed (ID: $POST_ID)${NC}\n"
else
  echo -e "${RED}✗ Create post failed${NC}\n"
fi

# ─── 3. Create post without token (should fail) ───────────────────────────────
echo -e "${YELLOW}[3] POST /posts without token (should fail)${NC}"
UNAUTH_RES=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Content-Type: application/json" \
  -d '{"type": "Lost", "title": "Test"}')
echo "Response: $UNAUTH_RES"

if echo "$UNAUTH_RES" | grep -q "401\|Access denied\|No token"; then
  echo -e "${GREEN}✓ Unauthorized correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Unauthorized should have been rejected${NC}\n"
fi

# ─── 4. Browse posts ──────────────────────────────────────────────────────────
echo -e "${YELLOW}[4] GET /posts${NC}"
GET_RES=$(curl -s -X GET "$BASE_URL/posts")
echo "Response: $GET_RES"

if echo "$GET_RES" | grep -q "Lost iPhone"; then
  echo -e "${GREEN}✓ Browse posts passed${NC}\n"
else
  echo -e "${RED}✗ Browse posts failed${NC}\n"
fi

# ─── 5. Browse with filters ───────────────────────────────────────────────────
echo -e "${YELLOW}[5] GET /posts?type=Lost&category=Electronics&q=iPhone${NC}"
FILTER_RES=$(curl -s -X GET "$BASE_URL/posts?type=Lost&category=Electronics&q=iPhone")
echo "Response: $FILTER_RES"

if echo "$FILTER_RES" | grep -q "Lost iPhone"; then
  echo -e "${GREEN}✓ Filter posts passed${NC}\n"
else
  echo -e "${RED}✗ Filter posts failed${NC}\n"
fi

# ─── 6. Browse with pagination ────────────────────────────────────────────────
echo -e "${YELLOW}[6] GET /posts?limit=1&page=1${NC}"
PAGE_RES=$(curl -s -X GET "$BASE_URL/posts?limit=1&page=1")
echo "Response: $PAGE_RES"

if echo "$PAGE_RES" | grep -q "id"; then
  echo -e "${GREEN}✓ Pagination passed${NC}\n"
else
  echo -e "${RED}✗ Pagination failed${NC}\n"
fi

# ─── 7. Get post by ID ────────────────────────────────────────────────────────
echo -e "${YELLOW}[7] GET /posts/:id${NC}"
GET_ONE_RES=$(curl -s -X GET "$BASE_URL/posts/$POST_ID")
echo "Response: $GET_ONE_RES"

if echo "$GET_ONE_RES" | grep -q "Lost iPhone"; then
  echo -e "${GREEN}✓ Get post by ID passed${NC}\n"
else
  echo -e "${RED}✗ Get post by ID failed${NC}\n"
fi

# ─── 8. Update post ───────────────────────────────────────────────────────────
echo -e "${YELLOW}[8] PUT /posts/:id${NC}"
UPDATE_RES=$(curl -s -X PUT "$BASE_URL/posts/$POST_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "found"}')
echo "Response: $UPDATE_RES"

if echo "$UPDATE_RES" | grep -q "updated successfully"; then
  echo -e "${GREEN}✓ Update post passed${NC}\n"
else
  echo -e "${RED}✗ Update post failed${NC}\n"
fi

# ─── 9. Delete post ───────────────────────────────────────────────────────────
echo -e "${YELLOW}[9] DELETE /posts/:id${NC}"
DELETE_RES=$(curl -s -X DELETE "$BASE_URL/posts/$POST_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $DELETE_RES"

if echo "$DELETE_RES" | grep -q "deleted successfully"; then
  echo -e "${GREEN}✓ Delete post passed${NC}\n"
else
  echo -e "${RED}✗ Delete post failed${NC}\n"
fi

# ─── 10. Get deleted post (should fail) ──────────────────────────────────────
echo -e "${YELLOW}[10] GET /posts/:id after delete (should fail)${NC}"
DELETED_RES=$(curl -s -X GET "$BASE_URL/posts/$POST_ID")
echo "Response: $DELETED_RES"

if echo "$DELETED_RES" | grep -q "not found\|404"; then
  echo -e "${GREEN}✓ Deleted post correctly returns 404${NC}\n"
else
  echo -e "${RED}✗ Deleted post should return 404${NC}\n"
fi

# ─── Cleanup ──────────────────────────────────────────────────────────────────
rm -f "$COOKIE_JAR"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}          Post Tests Complete           ${NC}"
echo -e "${YELLOW}========================================${NC}"