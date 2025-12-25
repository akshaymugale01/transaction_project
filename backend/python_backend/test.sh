#!/bin/bash

# Test script for transaction webhook service

BASE_URL="http://localhost:8000"

echo "🧪 Testing Transaction Webhook Service"
echo "======================================"

# Test 1: Health Check
echo ""
echo "1️⃣ Testing Health Check..."
curl -s -X GET "$BASE_URL/" | jq .

# Test 2: Send Single Transaction
echo ""
echo "2️⃣ Sending transaction webhook..."
TRANSACTION_ID="txn_$(date +%s)"
curl -s -X POST "$BASE_URL/v1/webhooks/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"transaction_id\": \"$TRANSACTION_ID\",
    \"source_account\": \"acc_user_789\",
    \"destination_account\": \"acc_merchant_456\",
    \"amount\": 150.50,
    \"currency\": \"USD\"
  }" | jq .

echo ""
echo "Transaction ID: $TRANSACTION_ID"

# Test 3: Check Transaction Status (PROCESSING)
echo ""
echo "3️⃣ Checking transaction status (should be PROCESSING)..."
sleep 2
curl -s -X GET "$BASE_URL/v1/transactions/$TRANSACTION_ID" | jq .

# Test 4: Duplicate Prevention
echo ""
echo "4️⃣ Sending duplicate webhook (should be accepted but not create duplicate)..."
curl -s -X POST "$BASE_URL/v1/webhooks/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"transaction_id\": \"$TRANSACTION_ID\",
    \"source_account\": \"acc_user_789\",
    \"destination_account\": \"acc_merchant_456\",
    \"amount\": 150.50,
    \"currency\": \"USD\"
  }" | jq .

# Test 5: Wait and check if processed
echo ""
echo "5️⃣ Waiting 30 seconds for processing..."
echo "   (Transaction should be marked as PROCESSED after ~30 seconds)"
sleep 32

echo ""
echo "6️⃣ Checking final transaction status (should be PROCESSED)..."
curl -s -X GET "$BASE_URL/v1/transactions/$TRANSACTION_ID" | jq .

echo ""
echo "======================================"
echo "✅ Testing complete!"
echo ""
echo "To test performance:"
echo "  ab -n 100 -c 10 -p test_payload.json -T application/json http://localhost:8000/v1/webhooks/transactions"
