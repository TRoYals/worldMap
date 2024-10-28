import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from urllib.parse import unquote
import logging
import shutil

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8000", 
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://localhost:8001",
    "http://127.0.0.1:3001",
    "https://startling-souffle-4fcae8.netlify.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

UPLOAD_DIR = Path("uploads")
if not UPLOAD_DIR.exists():
    UPLOAD_DIR.mkdir()

class UploadFileResponse(BaseModel):
    filename: str
    chunk_index: int 
    message: str

@app.post("/upload", response_model=UploadFileResponse)
async def upload_chunk(
    file: UploadFile = File(...),
    filename: str = Form(...),  # 添加 Form 参数
    chunk_index: int = Form(...),  # 添加 Form 参数
):
    try:
        decoded_filename = unquote(filename)
        logging.info(f"Receiving chunk {chunk_index} for file: {decoded_filename}")
        UPLOAD_DIR.mkdir(exist_ok=True)
        
        chunk_path = UPLOAD_DIR / f"{decoded_filename}.part{chunk_index}"
        content = await file.read()
        logging.info(f"Read {len(content)} bytes from uploaded chunk")
        
        with open(chunk_path, "wb") as buffer:
            buffer.write(content)
            
        logging.info(f"Successfully saved chunk to: {chunk_path}")
        
        return UploadFileResponse(
            filename=decoded_filename,
            chunk_index=chunk_index,
            message="chunk_upload_success"
        )
    except Exception as e:
        logging.error(f"Error saving chunk: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/uploaded-chunks")
async def get_uploaded_chunks(filename: str):
    try:
        decoded_filename = unquote(filename)
        chunks = list(UPLOAD_DIR.glob(f"{decoded_filename}.part*"))
        chunk_indices = [
            int(chunk.name.split("part")[-1]) 
            for chunk in chunks
        ]
        return {"uploadedChunks": sorted(chunk_indices)}
    except Exception as e:
        logging.error(f"Error getting uploaded chunks: {str(e)}")
        return {"uploadedChunks": []}

@app.post("/merge")
async def merge_chunks(filename: str, total_chunks: int):
    try:
        decoded_filename = unquote(filename)
        file_path = UPLOAD_DIR / decoded_filename
        chunks = sorted(UPLOAD_DIR.glob(f"{decoded_filename}.part*"))  
        if len(chunks) != total_chunks:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing chunks. Expected {total_chunks}, got {len(chunks)}"
            )    
        with open(file_path, 'wb') as outfile:
            for chunk_path in chunks:
                with open(chunk_path, 'rb') as infile:
                    shutil.copyfileobj(infile, outfile)
                chunk_path.unlink()           
        return {"message": "File merged successfully"}
    except Exception as e:
        logging.error(f"Error merging chunks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
