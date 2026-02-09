#!/bin/bash

# Load model name from .env if available
if [ -f .env ]; then
  export $(cat .env | grep OLLAMA_MODEL | xargs)
fi

MODEL=${OLLAMA_MODEL:-scb10x/typhoon-ocr1.5-3b}

echo "🚀 Starting to pull model: $MODEL"
echo "⏳ This may take a while depending on internet speed..."

docker compose exec ollama ollama pull $MODEL

if [ $? -eq 0 ]; then
  echo "✅ Model pulled successfully!"
else
  echo "❌ Failed to pull model. Please checking your internet connection."
fi
