// src/VideoPlayer.jsx
import React, { useRef, useEffect, useState } from "react";

const SERVER_BASE = import.meta.env.VITE_SERVER_BASE || "http://localhost:4000";

export default function VideoPlayer({ video, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (video && videoRef.current) {
      loadVideoWithAuth();
    }
  }, [video]);

  const loadVideoWithAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const videoUrl = `${SERVER_BASE}/api/videos/${encodeURIComponent(video.filename)}/stream`;
      
      // Fetch the video with authentication
      const response = await fetch(videoUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 404) {
          throw new Error("Video not found");
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      // Convert the response to a blob and create object URL
      const videoBlob = await response.blob();
      const videoObjectUrl = URL.createObjectURL(videoBlob);

      // Set the video source
      if (videoRef.current) {
        videoRef.current.src = videoObjectUrl;
        videoRef.current.load();
      }

      // Clean up object URL when component unmounts
      return () => {
        if (videoObjectUrl) {
          URL.revokeObjectURL(videoObjectUrl);
        }
      };

    } catch (err) {
      console.error("Video loading error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    loadVideoWithAuth();
  };

  if (!video) return null;

  return (
    <div style={overlay}>
      <div style={container}>
        <button style={closeBtn} onClick={onClose}>
          <i className="fas fa-times" style={{marginRight: '6px'}}></i>
          Close
        </button>
        
        {isLoading && (
          <div style={loadingStyle}>
            <i className="fas fa-spinner fa-spin" style={{fontSize: '24px', marginBottom: '10px'}}></i>
            <div>Loading video...</div>
          </div>
        )}
        
        {error && (
          <div style={errorContainer}>
            <div style={errorStyle}>
              <i className="fas fa-exclamation-triangle" style={{marginRight: '8px', fontSize: '18px'}}></i>
              {error}
            </div>
            <button onClick={handleRetry} style={retryButton}>
              <i className="fas fa-redo" style={{marginRight: '6px'}}></i>
              Retry
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          controls
          autoPlay
          style={{
            ...videoStyle,
            display: error || isLoading ? 'none' : 'block'
          }}
          onError={(e) => {
            console.error("Video playback error:", e);
            setError("Video playback failed. The file might be corrupted.");
          }}
        >
          Your browser does not support the video tag.
        </video>
        
        <div style={videoInfo}>
          <strong>{video.originalName}</strong>
          <div style={videoMeta}>
            <span>Status: {video.status}</span>
<span>Size: {video.size ? (video.size / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const container = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "800px",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  top: "12px",
  right: "12px",
  backgroundColor: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  padding: "8px 12px",
  cursor: "pointer",
  display: 'flex',
  alignItems: 'center',
  zIndex: 1001
};

const videoStyle = {
  width: "100%",
  maxHeight: "80vh",
  borderRadius: "8px",
};

const videoInfo = {
  marginTop: "12px",
  padding: "8px"
};

const videoMeta = {
  display: "flex",
  gap: "16px",
  marginTop: "4px",
  fontSize: "14px",
  color: "#64748b"
};

const loadingStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "60px",
  color: "#64748b",
  fontSize: "16px"
};

const errorContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  padding: "40px"
};

const errorStyle = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#dc2626",
  padding: "12px 16px",
  borderRadius: "4px",
  display: "flex",
  alignItems: "center",
  fontSize: "14px"
};

const retryButton = {
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "4px",
  padding: "8px 16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  fontSize: "14px"
};