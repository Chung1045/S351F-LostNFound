#!/bin/bash

BASE_URL="http://localhost:9090/api"
COOKIE_JAR="cookies.txt"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}   Lost & Found - Auth API Test Suite   ${NC}"
echo -e "${YELLOW}========================================${NC}\n"

# ─── 1. Register ─────────────────────────────────────────────────────────────
echo -e "${YELLOW}[1] POST /auth/register${NC}"
REGISTER_RES=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@email.com", "password": "password123"}')
echo "Response: $REGISTER_RES"

if echo "$REGISTER_RES" | grep -q "Account created successfully"; then
  echo -e "${GREEN}✓ Register passed${NC}\n"
else
  echo -e "${RED}✗ Register failed${NC}\n"
fi

# ─── 2. Login ─────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[2] POST /auth/login${NC}"
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@email.com", "password": "password123"}' \
  -c "$COOKIE_JAR" -b "$COOKIE_JAR")
echo "Response: $LOGIN_RES"

ACCESS_TOKEN=$(echo "$LOGIN_RES" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✓ Login passed — access token received${NC}\n"
else
  echo -e "${RED}✗ Login failed — no access token${NC}\n"
  exit 1
fi

# ─── 3. Get Profile ───────────────────────────────────────────────────────────
echo -e "${YELLOW}[3] GET /users/me${NC}"
PROFILE_RES=$(curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $PROFILE_RES"

if echo "$PROFILE_RES" | grep -q "testuser"; then
  echo -e "${GREEN}✓ Get profile passed${NC}\n"
else
  echo -e "${RED}✗ Get profile failed${NC}\n"
fi

# ─── 4. Refresh Token ─────────────────────────────────────────────────────────
echo -e "${YELLOW}[4] POST /auth/refresh${NC}"
REFRESH_RES=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -b "$COOKIE_JAR")
echo "Response: $REFRESH_RES"

NEW_ACCESS_TOKEN=$(echo "$REFRESH_RES" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$NEW_ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✓ Refresh passed — new access token received${NC}\n"
else
  echo -e "${RED}✗ Refresh failed${NC}\n"
fi

# ─── 5. Logout ────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[5] POST /auth/logout${NC}"
LOGOUT_RES=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -b "$COOKIE_JAR" -c "$COOKIE_JAR")
echo "Response: $LOGOUT_RES"

if echo "$LOGOUT_RES" | grep -q "Logged out successfully"; then
  echo -e "${GREEN}✓ Logout passed${NC}\n"
else
  echo -e "${RED}✗ Logout failed${NC}\n"
fi

# ─── 6. Refresh after logout (should fail) ────────────────────────────────────
echo -e "${YELLOW}[6] POST /auth/refresh (after logout — should fail)${NC}"
REFRESH_AFTER_LOGOUT=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -b "$COOKIE_JAR")
echo "Response: $REFRESH_AFTER_LOGOUT"

if echo "$REFRESH_AFTER_LOGOUT" | grep -q "401\|Invalid\|expired\|No refresh"; then
  echo -e "${GREEN}✓ Refresh after logout correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Refresh after logout should have been rejected${NC}\n"
fi

# ─── 7. Access protected route after logout ───────────────────────────────────
echo -e "${YELLOW}[7] GET /users/me with old access token (should still work for 15min)${NC}"
OLD_TOKEN_RES=$(curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $OLD_TOKEN_RES"
echo -e "${YELLOW}Note: Access token is still valid until it expires in 15 minutes${NC}\n"

# ─── Cleanup ──────────────────────────────────────────────────────────────────
rm -f "$COOKIE_JAR"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}           Test Suite Complete          ${NC}"
echo -e "${YELLOW}========================================${NC}"