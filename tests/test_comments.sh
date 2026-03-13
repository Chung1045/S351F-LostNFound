#!/bin/bash

BASE_URL="http://localhost:9090/api"
COOKIE_JAR="cookies_comment.txt"
DB_PATH="$(dirname "$0")/../public/db/lost_and_found.db"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}   Lost & Found - Comment Test Suite    ${NC}"
echo -e "${YELLOW}========================================${NC}\n"

# ─── 1. Login ─────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[1] Login to get access token${NC}"
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

# ─── 2. Seed a test post ──────────────────────────────────────────────────────
echo -e "${YELLOW}[2] Seeding a test post into DB${NC}"
POST_ID="test-post-$(date +%s)"
sqlite3 "$DB_PATH" <<EOF
INSERT OR IGNORE INTO posts (id, user_id, type, category, title, description, location, item_datetime)
VALUES ('$POST_ID', '$USER_ID', 'Lost', 'Electronics', 'Test Post', 'Test description', 'Test location', CURRENT_TIMESTAMP);
EOF
echo -e "${GREEN}✓ Test post seeded (ID: $POST_ID)${NC}\n"

# ─── 3. Get comments (empty) ──────────────────────────────────────────────────
echo -e "${YELLOW}[3] GET /posts/:post_id/comments (empty)${NC}"
GET_RES=$(curl -s -X GET "$BASE_URL/posts/$POST_ID/comments")
echo "Response: $GET_RES"

if echo "$GET_RES" | grep -q "\[\]"; then
  echo -e "${GREEN}✓ Get comments passed (empty)${NC}\n"
else
  echo -e "${RED}✗ Get comments failed${NC}\n"
fi

# ─── 4. Add a comment ─────────────────────────────────────────────────────────
echo -e "${YELLOW}[4] POST /posts/:post_id/comments${NC}"
ADD_RES=$(curl -s -X POST "$BASE_URL/posts/$POST_ID/comments" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a test comment"}')
echo "Response: $ADD_RES"

COMMENT_ID=$(echo "$ADD_RES" | grep -o '"commentId":[0-9]*' | cut -d':' -f2)

if echo "$ADD_RES" | grep -q "Comment added successfully"; then
  echo -e "${GREEN}✓ Add comment passed (ID: $COMMENT_ID)${NC}\n"
else
  echo -e "${RED}✗ Add comment failed${NC}\n"
fi

# ─── 5. Add empty comment (should fail) ───────────────────────────────────────
echo -e "${YELLOW}[5] POST /posts/:post_id/comments with empty content (should fail)${NC}"
EMPTY_RES=$(curl -s -X POST "$BASE_URL/posts/$POST_ID/comments" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": ""}')
echo "Response: $EMPTY_RES"

if echo "$EMPTY_RES" | grep -q "empty"; then
  echo -e "${GREEN}✓ Empty comment correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Empty comment should have been rejected${NC}\n"
fi

# ─── 6. Get comments (should have 1) ─────────────────────────────────────────
echo -e "${YELLOW}[6] GET /posts/:post_id/comments (should have 1)${NC}"
GET_RES2=$(curl -s -X GET "$BASE_URL/posts/$POST_ID/comments")
echo "Response: $GET_RES2"

if echo "$GET_RES2" | grep -q "test comment"; then
  echo -e "${GREEN}✓ Get comments passed${NC}\n"
else
  echo -e "${RED}✗ Get comments failed${NC}\n"
fi

# ─── 7. Delete comment ────────────────────────────────────────────────────────
echo -e "${YELLOW}[7] DELETE /comments/:id${NC}"
DELETE_RES=$(curl -s -X DELETE "$BASE_URL/comments/$COMMENT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $DELETE_RES"

if echo "$DELETE_RES" | grep -q "deleted successfully"; then
  echo -e "${GREEN}✓ Delete comment passed${NC}\n"
else
  echo -e "${RED}✗ Delete comment failed${NC}\n"
fi

# ─── 8. Add comment without token (should fail) ───────────────────────────────
echo -e "${YELLOW}[8] POST /posts/:post_id/comments without token (should fail)${NC}"
UNAUTH_RES=$(curl -s -X POST "$BASE_URL/posts/$POST_ID/comments" \
  -H "Content-Type: application/json" \
  -d '{"content": "Unauthorized comment"}')
echo "Response: $UNAUTH_RES"

if echo "$UNAUTH_RES" | grep -q "401\|No token\|Access denied"; then
  echo -e "${GREEN}✓ Unauthorized access correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Unauthorized access should have been rejected${NC}\n"
fi

# ─── Cleanup ──────────────────────────────────────────────────────────────────
rm -f "$COOKIE_JAR"
sqlite3 "$DB_PATH" "DELETE FROM posts WHERE id = '$POST_ID';"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}         Comment Tests Complete         ${NC}"
echo -e "${YELLOW}========================================${NC}"