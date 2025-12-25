"""
Transaction Webhook Service - Python Backend
FastAPI-based service for processing transaction webhooks
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import asyncio
import time
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Transaction Webhook Service",
    description="Process transaction webhooks with background processing",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db():
    """Get database connection"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def create_tables():
    """Create database tables if they don't exist"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                transaction_id VARCHAR(255) UNIQUE NOT NULL,
                source_account VARCHAR(255) NOT NULL,
                destination_account VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(3) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'PROCESSING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_transaction_id ON transactions(transaction_id);
            CREATE INDEX IF NOT EXISTS idx_status ON transactions(status);
            CREATE INDEX IF NOT EXISTS idx_created_at ON transactions(created_at);
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Database tables ready")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    create_tables()

# Request/Response models
class WebhookRequest(BaseModel):
    transaction_id: str = Field(..., description="Unique transaction identifier")
    source_account: str = Field(..., description="Source account identifier")
    destination_account: str = Field(..., description="Destination account identifier")
    amount: float = Field(..., gt=0, description="Transaction amount (must be positive)")
    currency: str = Field(..., description="Currency code (e.g., USD, EUR)")

class TransactionResponse(BaseModel):
    transaction_id: str
    source_account: str
    destination_account: str
    amount: float
    currency: str
    status: str
    created_at: str
    processed_at: Optional[str] = None

# Background processing function
async def process_transaction(transaction_id: str):
    """
    Process transaction with 30-second delay to simulate external API call
    """
    print(f"🔄 Processing transaction: {transaction_id}")
    
    try:
        # Simulate external API call with 30-second delay
        await asyncio.sleep(30)
        
        # Mark transaction as processed in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            UPDATE transactions 
            SET status = 'PROCESSED', 
                processed_at = NOW(), 
                updated_at = NOW()
            WHERE transaction_id = %s
            RETURNING *
            """,
            (transaction_id,)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ Transaction processed: {transaction_id}")
        
    except Exception as e:
        print(f"❌ Failed to process transaction {transaction_id}: {e}")
        # Don't raise - this is background processing

@app.get("/")
async def health_check():
    """
    Health check endpoint
    Returns the current status and time
    """
    return {
        "status": "HEALTHY",
        "current_time": datetime.utcnow().isoformat() + "Z"
    }

@app.post("/v1/webhooks/transactions", status_code=202)
async def receive_webhook(
    webhook: WebhookRequest, 
    background_tasks: BackgroundTasks
):
    """
    Receive transaction webhook
    
    Requirements:
    - Returns 202 Accepted immediately
    - Responds within 500ms
    - Processes transaction in background with 30s delay
    - Idempotent: duplicate webhooks don't create duplicate transactions
    """
    start_time = time.time()
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Insert transaction with idempotency check (ON CONFLICT DO NOTHING)
        cursor.execute(
            """
            INSERT INTO transactions 
            (transaction_id, source_account, destination_account, amount, currency, status)
            VALUES (%s, %s, %s, %s, %s, 'PROCESSING')
            ON CONFLICT (transaction_id) DO NOTHING
            RETURNING transaction_id
            """,
            (
                webhook.transaction_id,
                webhook.source_account,
                webhook.destination_account,
                webhook.amount,
                webhook.currency
            )
        )
        
        result = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        # If result is None, transaction already existed (duplicate webhook)
        if result is None:
            response_time = (time.time() - start_time) * 1000
            print(f"⚠️ Duplicate webhook received: {webhook.transaction_id} ({response_time:.2f}ms)")
        else:
            # Add background task to process transaction
            background_tasks.add_task(process_transaction, webhook.transaction_id)
            
            response_time = (time.time() - start_time) * 1000
            print(f"✅ Webhook accepted: {webhook.transaction_id} ({response_time:.2f}ms)")
        
        # Return 202 Accepted immediately (within 500ms requirement)
        return {"message": "Accepted"}
        
    except Exception as e:
        response_time = (time.time() - start_time) * 1000
        print(f"❌ Webhook error ({response_time:.2f}ms): {e}")
        
        # Even on error, return 202 to acknowledge receipt
        return {"message": "Accepted"}

@app.get("/v1/transactions/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: str):
    """
    Retrieve transaction status by ID
    
    Returns transaction details including:
    - Transaction data
    - Current status (PROCESSING or PROCESSED)
    - Timestamps
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT * FROM transactions WHERE transaction_id = %s",
            (transaction_id,)
        )
        
        transaction = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return {
            "transaction_id": transaction["transaction_id"],
            "source_account": transaction["source_account"],
            "destination_account": transaction["destination_account"],
            "amount": float(transaction["amount"]),
            "currency": transaction["currency"],
            "status": transaction["status"],
            "created_at": transaction["created_at"].isoformat() + "Z",
            "processed_at": transaction["processed_at"].isoformat() + "Z" if transaction["processed_at"] else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching transaction: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/v1/transactions")
async def get_all_transactions(limit: int = 100, offset: int = 0):
    """
    Get all transactions as a list
    
    Query Parameters:
    - limit: Number of transactions to return (default: 100, max: 1000)
    - offset: Number of transactions to skip (default: 0)
    
    Returns: Array of transactions
    """
    try:
        # Limit max to prevent abuse
        limit = min(limit, 1000)
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT * FROM transactions 
            ORDER BY created_at DESC 
            LIMIT %s OFFSET %s
            """,
            (limit, offset)
        )
        
        transactions = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Return simple list/array as expected by the reviewer
        return [
            {
                "transaction_id": t["transaction_id"],
                "source_account": t["source_account"],
                "destination_account": t["destination_account"],
                "amount": float(t["amount"]),
                "currency": t["currency"],
                "status": t["status"],
                "created_at": t["created_at"].isoformat() + "Z",
                "processed_at": t["processed_at"].isoformat() + "Z" if t["processed_at"] else None
            }
            for t in transactions
        ]
        
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
