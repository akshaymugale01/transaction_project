#!/bin/bash

# Setup script for Python backend

echo "🚀 Setting up Python Transaction Webhook Service..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "✨ Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the server:"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
echo "Or use uvicorn directly:"
echo "  uvicorn main:app --reload --host 0.0.0.0 --port 8000"
