# Python Transaction Webhook Service

A FastAPI-based service that processes transaction webhooks asynchronously with background processing.

## 📋 Requirements Met

✅ **API Endpoints:**
- `POST /v1/webhooks/transactions` - Receive transaction webhooks
- `GET /` - Health check
- `GET /v1/transactions/{transaction_id}` - Query transaction status

✅ **Response Requirements:**
- Returns 202 Accepted status code
- Responds within 500ms
- Accepts duplicate webhooks gracefully

✅ **Background Processing:**
- Processes transactions with 30-second delay
- Simulates external API calls
- Stores results in PostgreSQL

✅ **Idempotency:**
- Uses `ON CONFLICT DO NOTHING` to prevent duplicates
- Same transaction_id can be sent multiple times safely

✅ **Data Storage:**
- PostgreSQL database with full transaction history
- Tracks status and timing information

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL database
- Virtual environment (recommended)

### Setup

1. **Configure environment variables:**
```bash
# Create .env file in python_backend directory
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

2. **Run setup script:**
```bash
cd python_backend
chmod +x setup.sh
./setup.sh
```

3. **Start the server:**
```bash
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: http://localhost:8000

## 🧪 Testing

### Automated Tests
```bash
chmod +x test.sh
./test.sh
```

### Manual Testing

**Health Check:**
```bash
curl http://localhost:8000/
```

**Send Webhook:**
```bash
curl -X POST http://localhost:8000/v1/webhooks/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_abc123def456",
    "source_account": "acc_user_789",
    "destination_account": "acc_merchant_456",
    "amount": 150.50,
    "currency": "USD"
  }'
```

**Check Status:**
```bash
curl http://localhost:8000/v1/transactions/txn_abc123def456
```

## 📊 Success Criteria

1. ✅ **Single Transaction:** Webhook processed after ~30 seconds
2. ✅ **Duplicate Prevention:** Same webhook multiple times = only one transaction
3. ✅ **Performance:** Responds in <500ms even during processing
4. ✅ **Reliability:** Continues processing without errors

## 🏗️ Architecture

- **Framework:** FastAPI (high-performance Python)
- **Database:** PostgreSQL (ACID compliance)
- **Background Processing:** AsyncIO (built-in Python)
- **Deployment:** Can be deployed to any cloud (Railway, Render, AWS, etc.)

## 📝 API Documentation

Interactive API docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔧 Technical Choices

**Why FastAPI?**
- Modern, fast Python framework
- Automatic API documentation
- Built-in async support for background tasks
- Type validation with Pydantic

**Why PostgreSQL?**
- ACID compliance for reliable transactions
- Easy `ON CONFLICT` for idempotency
- Widely supported for deployment

**Why AsyncIO for background processing?**
- Built-in to Python (no external dependencies)
- Simple and lightweight
- Perfect for I/O-bound operations like API calls

## 🌐 Deployment

The service is ready to deploy to:
- **Railway:** `railway up`
- **Render:** Connect GitHub repo
- **AWS/GCP/Azure:** Use Docker or direct deployment

For production, consider:
- Using a proper task queue (Celery, RQ) for high scale
- Adding monitoring (Sentry, DataDog)
- Setting up proper logging
- Adding authentication for webhook endpoint
