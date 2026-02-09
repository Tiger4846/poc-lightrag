#!/bin/sh

# Start the Python OCR service in the background
echo "🚀 Starting OCR Service at port 8001..."
python3 ocr-service/main.py &

# Start the OCR Worker
echo "👷 Starting OCR Worker..."
# Use node_modules/.bin/tsx directly in case it's not in global PATH
./node_modules/.bin/tsx worker.ts &

# Start the Next.js application
echo "🚀 Starting Next.js App at port 3000..."
node server.js
