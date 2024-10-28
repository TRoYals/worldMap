"use client"
import Link from "next/link";
import React from "react";
import axios from "axios"
import {useState} from "react";

const CHUNK_SIZE = 1024*1024;

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'paused' | 'completed'>('idle');
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setProgress(0);
      setUploadStatus('idle');
      setCurrentChunkIndex(0);
    }
  }

  const pauseUpload = () => {
    setUploadStatus('paused');
  }

  const resumeUpload = () => {
    if(file) {
      setUploadStatus('uploading');
      uploadFile();
    }
  }

  const uploadFile = async () => {
    if(!file) return;
    
    setUploadStatus('uploading');
    const totalChunks = Math.ceil(file.size/CHUNK_SIZE);
    
    try {
      const uploadedChunks = await getUploadedChunks(file.name);
      const uploadedChunkSet = new Set(uploadedChunks);
      let startChunkIndex = currentChunkIndex;
      if (uploadedChunks.length > 0) {
        startChunkIndex = Math.max(...uploadedChunks) + 1;
      }

      for (let chunkIndex = startChunkIndex; chunkIndex < totalChunks; chunkIndex++) {
        if(uploadStatus === 'paused') {
          setCurrentChunkIndex(chunkIndex);
          return;
        }

        if (uploadedChunkSet.has(chunkIndex)) {
          setProgress(Math.round((chunkIndex + 1) / totalChunks * 100));
          continue;
        }

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);
        
        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("filename", file.name);
        formData.append("chunk_index", chunkIndex.toString());  // 修改这行
        formData.append("totalChunks", totalChunks.toString());
        
        try {
          await axios.post("http://127.0.0.1:8000/upload", formData);
          setProgress(Math.round((chunkIndex + 1) / totalChunks * 100));
          setCurrentChunkIndex(chunkIndex);
        } catch(e) {
          console.error("上传失败:", e);
          setUploadStatus('paused');
          return;
        }
      }

      try {
        await axios.post("http://127.0.0.1:8000/merge", {
          fileName: file.name,
          totalChunks: totalChunks
        });
        setProgress(100);
        setUploadStatus('completed');
      } catch(e) {
        console.error("合并文件失败:", e);
        setUploadStatus('paused');
      }
    } catch(e) {
      console.error("上传过程出错:", e);
      setUploadStatus('paused');
    }
  }

  const getUploadedChunks = async (fileName: string) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/uploaded-chunks?filename=${fileName}`);
      return response.data.uploadedChunks;
    } catch(e) {
      console.error("获取已上传分片失败:", e);
      return [];
    }
  }

  const uploadChunk = async (chunk: Blob, chunkIndex: number) => {
    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('filename', file.name);
    formData.append('chunk_index', chunkIndex.toString()); 

    try {
      const response = await axios.post('http://127.0.0.1:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('上传分片失败:', error);
      throw error;
    }
  };

  return (
    <div className="p-4">
      <input 
        type="file" 
        onChange={handleFileChange}
        className="mb-4"
      />
      <div className="space-x-2">
        {uploadStatus === 'idle' && (
          <button 
            onClick={uploadFile}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            开始上传
          </button>
        )}
        {uploadStatus === 'uploading' && (
          <button 
            onClick={pauseUpload}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            暂停上传
          </button>
        )}
        {uploadStatus === 'paused' && (
          <button 
            onClick={resumeUpload}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            继续上传
          </button>
        )}
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{width: `${progress}%`}}
          ></div>
        </div>
        <div className="mt-2">上传进度: {progress}%</div>
        {uploadStatus === 'completed' && (
          <div className="text-green-500">上传完成!</div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <FileUpload></FileUpload>
  );
}
