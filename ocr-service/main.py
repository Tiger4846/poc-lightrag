from dotenv import load_dotenv
import os
from pathlib import Path

# Load .env from parent directory (lightrag-directory/.env)
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)
print(f"📂 Loading .env from: {env_path}")
print(f"📂 .env exists: {env_path.exists()}")

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typhoon_ocr import ocr_document
import tempfile
import uvicorn
import logging
import httpx
import requests
import json
from pdf2image import convert_from_path

# Setup logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="OCR Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OCR Mode: "local" (Ollama) or "api" (OpenTyphoon API)
OCR_MODE = os.getenv("OCR_MODE", "local")

# Local Ollama settings
OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_API_URL = f"{OLLAMA_BASE_URL}/v1"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "scb10x/typhoon-ocr1.5-3b")

# OpenTyphoon API settings
TYPHOON_API_KEY = os.getenv("TYPHOON_API_KEY", "")
TYPHOON_API_URL = os.getenv("TYPHOON_API_URL", "https://api.opentyphoon.ai/v1/ocr")
TYPHOON_MODEL = os.getenv("TYPHOON_MODEL", "typhoon-ocr")

logger.info(f"🚀 OCR Service starting...")
logger.info(f"📡 OCR_MODE: {OCR_MODE}")

if OCR_MODE == "local":
    logger.info(f"📡 OLLAMA_BASE_URL: {OLLAMA_BASE_URL}")
    logger.info(f"🤖 OLLAMA_MODEL: {OLLAMA_MODEL}")
else:
    logger.info(f"📡 TYPHOON_API_URL: {TYPHOON_API_URL}")
    logger.info(f"🤖 TYPHOON_MODEL: {TYPHOON_MODEL}")
    logger.info(f"🔑 API_KEY: {'***' + TYPHOON_API_KEY[-4:] if TYPHOON_API_KEY else 'NOT SET'}")


async def check_ollama_running() -> bool:
    """Check if Ollama server is running"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return response.status_code == 200
    except Exception as e:
        logger.error(f"❌ Ollama connection error: {e}")
        return False


async def check_model_exists() -> tuple[bool, list[str]]:
    """Check if the required model exists in Ollama"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if response.status_code != 200:
                return False, []
            
            data = response.json()
            models = [m.get("name", "") for m in data.get("models", [])]
            
            model_exists = any(
                OLLAMA_MODEL in m or m.startswith(OLLAMA_MODEL.split(":")[0])
                for m in models
            )
            
            return model_exists, models
    except Exception as e:
        logger.error(f"❌ Error checking models: {e}")
        return False, []


async def ensure_ollama_ready() -> dict:
    """Ensure Ollama is running and has the required model"""
    logger.debug("🔍 Checking if Ollama is running...")
    ollama_running = await check_ollama_running()
    
    if not ollama_running:
        return {
            "ready": False,
            "error": "Ollama server is not running. Please start Ollama with 'ollama serve'"
        }
    
    logger.info("✅ Ollama server is running")
    
    logger.debug(f"🔍 Checking if model '{OLLAMA_MODEL}' exists...")
    model_exists, available_models = await check_model_exists()
    
    if not model_exists:
        return {
            "ready": False,
            "error": f"Model '{OLLAMA_MODEL}' not found. Available models: {available_models}. "
                     f"Please run: ollama pull {OLLAMA_MODEL}"
        }
    
    logger.info(f"✅ Model '{OLLAMA_MODEL}' is available")
    
    return {"ready": True, "model": OLLAMA_MODEL, "available_models": available_models}


def ensure_api_ready() -> dict:
    """Ensure OpenTyphoon API is configured"""
    if not TYPHOON_API_KEY:
        return {
            "ready": False,
            "error": "TYPHOON_API_KEY is not set. Please add it to your .env file."
        }
    
    return {"ready": True, "model": TYPHOON_MODEL, "api_url": TYPHOON_API_URL}


def ocr_with_typhoon_api(file_path: str) -> str:
    """Perform OCR using OpenTyphoon API"""
    logger.info(f"🌐 Using OpenTyphoon API for OCR")
    
    with open(file_path, 'rb') as file:
        files = {'file': file}
        data = {
            'model': TYPHOON_MODEL,
            'task_type': 'default',
            'max_tokens': '16384',
            'temperature': '0.1',
            'top_p': '0.6',
            'repetition_penalty': '1.2'
        }
        
        headers = {
            'Authorization': f'Bearer {TYPHOON_API_KEY}'
        }
        
        logger.debug(f"📤 Sending request to {TYPHOON_API_URL}")
        response = requests.post(TYPHOON_API_URL, files=files, data=data, headers=headers, timeout=600)
        
        if response.status_code == 200:
            result = response.json()
            logger.debug(f"📥 Response received: {result}")
            
            # Extract text from successful results
            extracted_texts = []
            for page_result in result.get('results', []):
                if page_result.get('success') and page_result.get('message'):
                    content = page_result['message']['choices'][0]['message']['content']
                    try:
                        parsed_content = json.loads(content)
                        text = parsed_content.get('natural_text', content)
                    except json.JSONDecodeError:
                        text = content
                    extracted_texts.append(text)
                elif not page_result.get('success'):
                    logger.error(f"Error processing {page_result.get('filename', 'unknown')}: {page_result.get('error', 'Unknown error')}")
            
            return '\n'.join(extracted_texts)
        else:
            logger.error(f"❌ API Error: {response.status_code}")
            logger.error(response.text)
            raise Exception(f"API Error: {response.status_code} - {response.text}")


def ocr_with_ollama(file_path: str) -> str:
    """Perform OCR using local Ollama"""
    logger.info(f"🖥️ Using local Ollama for OCR")
    
    return ocr_document(
        file_path,
        base_url=OLLAMA_API_URL,
        api_key="ollama",
        model=OLLAMA_MODEL
    )


@app.get("/health")
async def health_check():
    """Health check with OCR status"""
    logger.debug("✅ Health check called")
    
    if OCR_MODE == "local":
        ocr_status = await ensure_ollama_ready()
    else:
        ocr_status = ensure_api_ready()
    
    return {
        "status": "ok" if ocr_status["ready"] else "degraded",
        "service": "ocr-service",
        "mode": OCR_MODE,
        "ocr": ocr_status
    }


@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    """
    Perform OCR on uploaded image/PDF file
    """
    logger.info(f"📥 Received OCR request for file: {file.filename}")
    logger.info(f"📡 OCR Mode: {OCR_MODE}")
    
    # Check OCR service readiness
    if OCR_MODE == "local":
        ocr_status = await ensure_ollama_ready()
    else:
        ocr_status = ensure_api_ready()
    
    if not ocr_status["ready"]:
        logger.error(f"❌ OCR not ready: {ocr_status['error']}")
        raise HTTPException(status_code=503, detail=ocr_status["error"])
    
    if not file.filename:
        logger.error("❌ No filename provided")
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Check file extension
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
    ext = os.path.splitext(file.filename)[1].lower()
    logger.debug(f"📄 File extension: {ext}")
    
    if ext not in allowed_extensions:
        logger.error(f"❌ Unsupported file format: {ext}")
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Save uploaded file to temp directory
        logger.debug("💾 Saving file to temp directory...")
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        logger.info(f"📁 Temp file saved: {tmp_path}")
        logger.info(f"📊 File size: {len(content)} bytes")
        
        # Perform OCR based on mode
        logger.info(f"🔍 Starting OCR...")
        logger.info(f"⏳ This may take a while for large files...")
        
        page_count = 1
        markdown = ""
        
        if ext == '.pdf':
             logger.info("📄 PDF detected, converting to images...")
             try:
                 images = convert_from_path(tmp_path)
                 page_count = len(images)
                 logger.info(f"📄 PDF has {page_count} pages")
                 
                 results = []
                 for i, image in enumerate(images):
                     image_path = f"{tmp_path}_{i}.jpg"
                     image.save(image_path, "JPEG")
                     logger.info(f"🔍 Processing Page {i+1}/{page_count}...")
                     
                     if OCR_MODE == "local":
                         text = ocr_with_ollama(image_path)
                     else:
                         text = ocr_with_typhoon_api(image_path)
                     
                     results.append(f"## Page {i+1}\n\n{text}")
                     
                     if os.path.exists(image_path):
                        os.unlink(image_path)
                        
                 markdown = "\n\n---\n\n".join(results)
             except Exception as pdf_err:
                 logger.error(f"❌ PDF Processing Error: {pdf_err}")
                 raise pdf_err
        else:
            if OCR_MODE == "local":
                markdown = ocr_with_ollama(tmp_path)
            else:
                markdown = ocr_with_typhoon_api(tmp_path)
        
        logger.info(f"✅ OCR completed successfully!")
        logger.debug(f"📝 Result length: {len(markdown) if markdown else 0} characters")
        
        # Clean up temp file
        os.unlink(tmp_path)
        logger.debug(f"🗑️ Temp file cleaned up")
        
        return {
            "success": True,
            "filename": file.filename,
            "mode": OCR_MODE,
            "markdown": markdown,
            "page_count": page_count
        }
        
    except Exception as e:
        logger.error(f"❌ OCR Error: {str(e)}")
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.unlink(tmp_path)
            logger.debug("🗑️ Temp file cleaned up after error")
        
        raise HTTPException(status_code=500, detail=str(e))


@app.on_event("startup")
async def startup_event():
    """Check OCR status on startup"""
    logger.info("=" * 50)
    logger.info("🚀 Starting OCR Service on port 8001")
    logger.info(f"📡 OCR Mode: {OCR_MODE}")
    logger.info("=" * 50)
    
    if OCR_MODE == "local":
        ocr_status = await ensure_ollama_ready()
        
        if ocr_status["ready"]:
            logger.info("✅ Ollama is ready!")
            logger.info(f"📋 Available models: {ocr_status.get('available_models', [])}")
        else:
            logger.warning(f"⚠️ Ollama not ready: {ocr_status.get('error', 'Unknown error')}")
            logger.warning("⚠️ OCR requests will fail until Ollama is properly configured")
    else:
        ocr_status = ensure_api_ready()
        
        if ocr_status["ready"]:
            logger.info("✅ OpenTyphoon API is configured!")
            logger.info(f"📡 API URL: {TYPHOON_API_URL}")
        else:
            logger.warning(f"⚠️ API not ready: {ocr_status.get('error', 'Unknown error')}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="debug")
