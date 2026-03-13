#!/bin/bash

BASE_URL="http://localhost:9090/api"
COOKIE_JAR="cookies_notification.txt"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Lost & Found - Notification Test Suite ${NC}"
echo -e "${YELLOW}========================================${NC}\n"

# ─── 1. Login to get access token ────────────────────────────────────────────
echo -e "${YELLOW}[1] Login to get access token${NC}"
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@email.com", "password": "password123"}' \
  -c "$COOKIE_JAR" -b "$COOKIE_JAR")

ACCESS_TOKEN=$(echo "$LOGIN_RES" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo "$LOGIN_RES" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✓ Login passed — token received${NC}"
  echo "User ID: $USER_ID"
else
  echo -e "${RED}✗ Login failed — cannot proceed${NC}"
  exit 1
fi
echo ""

# ─── 2. Seed a test notification directly into DB ────────────────────────────
echo -e "${YELLOW}[2] Seeding test notifications into DB${NC}"
sqlite3 ../public/db/lost_and_found.db <<EOF
INSERT OR IGNORE INTO notifications (user_id, type, message, is_read, link_id)
VALUES ('$USER_ID', 'system', 'Test notification 1', 0, NULL);
INSERT OR IGNORE INTO notifications (user_id, type, message, is_read, link_id)
VALUES ('$USER_ID', 'system', 'Test notification 2', 0, NULL);
EOF
echo -e "${GREEN}✓ Test notifications seeded${NC}\n"

# ─── 3. Get notifications ─────────────────────────────────────────────────────
echo -e "${YELLOW}[3] GET /notifications${NC}"
GET_RES=$(curl -s -X GET "$BASE_URL/notifications" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $GET_RES"

if echo "$GET_RES" | grep -q "Test notification"; then
  echo -e "${GREEN}✓ Get notifications passed${NC}\n"
else
  echo -e "${RED}✗ Get notifications failed${NC}\n"
fi

# ─── 4. Get notification ID from response ────────────────────────────────────
NOTIFICATION_ID=$(echo "$GET_RES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Using notification ID: $NOTIFICATION_ID"
echo ""

# ─── 5. Mark specific notification as read ───────────────────────────────────
echo -e "${YELLOW}[4] PUT /notifications/$NOTIFICATION_ID/read${NC}"
MARK_RES=$(curl -s -X PUT "$BASE_URL/notifications/$NOTIFICATION_ID/read" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $MARK_RES"

if echo "$MARK_RES" | grep -q "marked as read"; then
  echo -e "${GREEN}✓ Mark as read passed${NC}\n"
else
  echo -e "${RED}✗ Mark as read failed${NC}\n"
fi

# ─── 6. Mark all notifications as read ───────────────────────────────────────
echo -e "${YELLOW}[5] PUT /notifications/read-all${NC}"
MARK_ALL_RES=$(curl -s -X PUT "$BASE_URL/notifications/read-all" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $MARK_ALL_RES"

if echo "$MARK_ALL_RES" | grep -q "All notifications marked as read"; then
  echo -e "${GREEN}✓ Mark all as read passed${NC}\n"
else
  echo -e "${RED}✗ Mark all as read failed${NC}\n"
fi

# ─── 7. Verify all are read ───────────────────────────────────────────────────
echo -e "${YELLOW}[6] GET /notifications (verify all read)${NC}"
VERIFY_RES=$(curl -s -X GET "$BASE_URL/notifications" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $VERIFY_RES"

if echo "$VERIFY_RES" | grep -q '"is_read":1'; then
  echo -e "${GREEN}✓ All notifications are read${NC}\n"
else
  echo -e "${RED}✗ Notifications not marked as read${NC}\n"
fi

# ─── 8. Test unauthorized access ─────────────────────────────────────────────
echo -e "${YELLOW}[7] GET /notifications without token (should fail)${NC}"
UNAUTH_RES=$(curl -s -X GET "$BASE_URL/notifications")
echo "Response: $UNAUTH_RES"

if echo "$UNAUTH_RES" | grep -q "401\|No token\|Access denied"; then
  echo -e "${GREEN}✓ Unauthorized access correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Unauthorized access should have been rejected${NC}\n"
fi

# ─── Cleanup ──────────────────────────────────────────────────────────────────
rm -f "$COOKIE_JAR"

# Clean up seeded notifications
sqlite3 ../public/db/lost_and_found.db "DELETE FROM notifications WHERE message LIKE 'Test notification%';"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}        Notification Tests Complete     ${NC}"
echo -e "${YELLOW}========================================${NC}"