
// import React, { useRef, useState } from "react";
// import axios from "axios";

// const UPLOAD_URL = "/api/videos"; // change this to your backend upload endpoint
// const MAX_FILE_SIZE = 1024 * 1024 * 1024 * 1.5; // 1.5GB limit (tweak as needed)
// const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];

// function readableBytes(bytes) {
//   if (bytes === 0) return "0 B";
//   const k = 1024;
//   const sizes = ["B", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
// }

// export default function VideoUploadPage() {
//   const inputRef = useRef(null);

//   // files: { id, file, name, size, type, preview, status, progress, controller }
//   const [files, setFiles] = useState([]);

//   function addFiles(selectedFiles) {
//     const arr = Array.from(selectedFiles).map((file, i) => {
//       const id = `${Date.now()}-${Math.random().toString(16).slice(2)}-${i}`;
//       return {
//         id,
//         file,
//         name: file.name,
//         size: file.size,
//         type: file.type,
//         preview: URL.createObjectURL(file),
//         status: "queued", // queued | uploading | uploaded | failed | canceled
//         progress: 0,
//         controller: null,
//         error: null,
//       };
//     });

//     // filter invalid files (type/size), but keep info for showing errors
//     const validated = arr.map(a => {
//       if (!ALLOWED_TYPES.includes(a.type)) {
//         return { ...a, status: "failed", error: "Invalid file type" };
//       }
//       if (a.size > MAX_FILE_SIZE) {
//         return { ...a, status: "failed", error: "File too large" };
//       }
//       return a;
//     });

//     setFiles(prev => [...prev, ...validated]);
//   }

//   function handleSelect(e) {
//     addFiles(e.target.files);
//     e.target.value = "";
//   }

//   function handleDrop(e) {
//     e.preventDefault();
//     if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
//   }

//   function handleDragOver(e) {
//     e.preventDefault();
//   }

//   function removeFile(id) {
//     setFiles(prev => {
//       // revoke preview url for memory
//       const f = prev.find(x => x.id === id);
//       if (f?.preview) URL.revokeObjectURL(f.preview);
//       // if uploading, abort the request
//       if (f?.controller) f.controller.abort();
//       return prev.filter(x => x.id !== id);
//     });
//   }

//   async function uploadFile(fileObj) {
//     // skip if failed validation
//     if (fileObj.status === "failed") return;

//     const controller = new AbortController();
//     setFiles(prev =>
//       prev.map(f => (f.id === fileObj.id ? { ...f, status: "uploading", controller, progress: 0, error: null } : f))
//     );

//     const fd = new FormData();
//     fd.append("video", fileObj.file);
//     fd.append("title", fileObj.name);

//     try {
//       const resp = await axios.post(UPLOAD_URL, fd, {
//         signal: controller.signal,
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//         onUploadProgress: (progressEvent) => {
//           const pct = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
//           setFiles(prev => prev.map(f => (f.id === fileObj.id ? { ...f, progress: pct } : f)));
//         },
//         timeout: 0, // no timeout for potentially large uploads; set appropriately for production
//       });

//       // When upload finishes:
//       setFiles(prev => prev.map(f => (f.id === fileObj.id ? { ...f, status: "uploaded", progress: 100, controller: null } : f)));

//       // Optionally: store server response to file item (e.g. videoId)
//       // setFiles(prev => prev.map(f => f.id === fileObj.id ? {...f, serverData: resp.data } : f));

//       return resp.data;
//     } catch (err) {
//       if (axios.isCancel(err) || err.name === "CanceledError") {
//         setFiles(prev => prev.map(f => (f.id === fileObj.id ? { ...f, status: "canceled", controller: null, error: "Upload canceled" } : f)));
//       } else {
//         const message = err?.response?.data?.message || err.message || "Upload failed";
//         setFiles(prev => prev.map(f => (f.id === fileObj.id ? { ...f, status: "failed", controller: null, error: message } : f)));
//       }
//       return null;
//     }
//   }

//   function uploadAll() {
//     // Upload queued files in parallel (or change to sequential by awaiting in loop)
//     files
//       .filter(f => f.status === "queued")
//       .forEach(f => {
//         uploadFile(f);
//       });
//   }

//   function cancelUpload(id) {
//     setFiles(prev => {
//       const item = prev.find(f => f.id === id);
//       if (item?.controller) item.controller.abort();
//       return prev.map(f => (f.id === id ? { ...f, status: "canceled", controller: null, error: "Canceled by user" } : f));
//     });
//   }

//   function retryUpload(id) {
//     const item = files.find(f => f.id === id);
//     if (!item) return;
//     // reset status & try again
//     setFiles(prev => prev.map(f => (f.id === id ? { ...f, status: "queued", progress: 0, error: null } : f)));
//     // schedule actual upload in next tick to allow state to update
//     setTimeout(() => uploadFile({ ...item, status: "queued" }), 50);
//   }

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.title}>Upload Your Video</h2>

//       <div
//         style={styles.uploadBox}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//         onClick={() => inputRef.current && inputRef.current.click()}
//         role="button"
//         tabIndex={0}
//       >
//         <input
//           ref={inputRef}
//           type="file"
//           accept="video/*"
//           multiple
//           onChange={handleSelect}
//           style={{ display: "none" }}
//         />
//         <div style={{ textAlign: "center" }}>
//           <div style={styles.bigIcon}>📁</div>
//           <div style={styles.uploadText}>Click to select or drag & drop videos here</div>
//           <div style={styles.smallText}>Supported: mp4 / webm / mov / mkv • Max {readableBytes(MAX_FILE_SIZE)}</div>
//         </div>
//       </div>

//       <div style={styles.controls}>
//         <button onClick={uploadAll} disabled={!files.some(f => f.status === "queued")}>
//           Upload All
//         </button>
//         <button
//           onClick={() => {
//             // clear all non-uploading files
//             setFiles(prev => {
//               prev.forEach(p => p.preview && URL.revokeObjectURL(p.preview));
//               return prev.filter(x => x.status === "uploading"); // keep uploading if any
//             });
//           }}
//           style={{ marginLeft: 8 }}
//         >
//           Clear Completed/Failed
//         </button>
//       </div>

//       <div style={styles.fileList}>
//         {files.length === 0 && <div style={styles.emptyNote}>No files selected yet</div>}

//         {files.map((f) => (
//           <div key={f.id} style={styles.fileItem}>
//             <div style={styles.thumbWrap}>
//               <video src={f.preview} style={styles.thumb} muted />
//             </div>

//             <div style={styles.meta}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
//                 <div style={{ fontWeight: 600 }}>{f.name}</div>
//                 <div style={{ color: "#666", fontSize: 13 }}>{readableBytes(f.size)}</div>
//               </div>

//               <div style={styles.progressRow}>
//                 <div style={styles.progressBar} aria-hidden>
//                   <div style={{ ...styles.progressFill, width: `${f.progress}%` }} />
//                 </div>
//                 <div style={{ marginLeft: 8, minWidth: 50 }}>{f.progress}%</div>
//               </div>

//               <div style={styles.row}>
//                 <div style={{ fontSize: 13, color: "#444" }}>
//                   {f.status === "queued" && <span>Queued</span>}
//                   {f.status === "uploading" && <span>Uploading...</span>}
//                   {f.status === "uploaded" && <span style={{ color: "green" }}>Uploaded</span>}
//                   {f.status === "failed" && <span style={{ color: "red" }}>Failed</span>}
//                   {f.status === "canceled" && <span style={{ color: "#999" }}>Canceled</span>}
//                 </div>

//                 <div style={styles.actions}>
//                   {f.status === "queued" && <button onClick={() => uploadFile(f)}>Upload</button>}
//                   {f.status === "uploading" && <button onClick={() => cancelUpload(f.id)}>Cancel</button>}
//                   {f.status === "failed" && <button onClick={() => retryUpload(f.id)}>Retry</button>}
//                   <button onClick={() => removeFile(f.id)} style={{ marginLeft: 8 }}>
//                     Remove
//                   </button>
//                 </div>
//               </div>

//               {f.error && <div style={styles.errorText}>{f.error}</div>}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     width: "92%",
//     maxWidth: 980,
//     margin: "28px auto",
//     fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
//   },
//   title: {
//     fontSize: 28,
//     marginBottom: 18,
//     textAlign: "center",
//   },
//   uploadBox: {
//     border: "2px dashed #cbd5e1",
//     borderRadius: 12,
//     padding: 28,
//     cursor: "pointer",
//     background: "#fff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     userSelect: "none",
//   },
//   bigIcon: { fontSize: 36, marginBottom: 8 },
//   uploadText: { fontSize: 16, fontWeight: 600 },
//   smallText: { fontSize: 13, color: "#666", marginTop: 6 },

//   controls: { marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" },

//   fileList: { marginTop: 18 },
//   emptyNote: { color: "#666", padding: 18, textAlign: "center", background: "#fafafa", borderRadius: 8 },

//   fileItem: {
//     display: "flex",
//     gap: 12,
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 10,
//     background: "#fff",
//     boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
//   },
//   thumbWrap: {
//     width: 160,
//     height: 90,
//     overflow: "hidden",
//     borderRadius: 6,
//     background: "#000",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   thumb: { width: "100%", height: "100%", objectFit: "cover" },

//   meta: { flex: 1 },

//   progressRow: { display: "flex", alignItems: "center", marginTop: 8 },

//   progressBar: {
//     height: 8,
//     background: "#eef2ff",
//     borderRadius: 8,
//     overflow: "hidden",
//     flex: 1,
//   },
//   progressFill: {
//     height: "100%",
//     background: "linear-gradient(90deg,#34d399,#60a5fa)",
//     width: "0%",
//     transition: "width 0.25s linear",
//   },

//   row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 },

//   actions: { display: "flex", gap: 6 },

//   errorText: { color: "#b91c1c", marginTop: 8, fontSize: 13 },
// };
// src/VideoUploadPage.jsx
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

/** CHANGE THIS to point to your server */
const SERVER_BASE = "http://localhost:4000";
const UPLOAD_URL = `${SERVER_BASE}/api/videos`;
const SOCKET_URL = SERVER_BASE;



const MAX_FILE_SIZE = 1024 * 1024 * 1024 * 1.5;
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];

function readableBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function VideoUploadPage() {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [socket, setSocket] = useState(null);
  
// const response = await fetch('http://localhost:4000/api/videos', {
//   method: 'POST',
//   headers: {
//     'Authorization': `Bearer ${token}`,
//   },
//   body: formData,
// });

  // connect socket once
  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // handle processing updates from server
    const handler = (payload) => {
      const { videoId, stage, percent } = payload;
      setFiles(prev => prev.map(f => {
        if (f.videoId && f.videoId === videoId) {
          return { ...f, processingStage: stage, processingPercent: percent };
        }
        return f;
      }));
    };

    socket.on("processing:update", handler);
    return () => {
      socket.off("processing:update", handler);
    };
  }, [socket]);

  function addFiles(selectedFiles) {
    const arr = Array.from(selectedFiles).map((file, i) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}-${i}`;
      return {
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: URL.createObjectURL(file),
        status: "queued",
        progress: 0,
        controller: null,
        error: null,
        videoId: null, // server-assigned id after upload
        processingStage: null,
        processingPercent: 0,
      };
    });

    const validated = arr.map(a => {
      if (!ALLOWED_TYPES.includes(a.type)) return { ...a, status: "failed", error: "Invalid file type" };
      if (a.size > MAX_FILE_SIZE) return { ...a, status: "failed", error: "File too large" };
      return a;
    });

    setFiles(prev => [...prev, ...validated]);
  }

  function handleSelect(e) {
    addFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  }
  function handleDragOver(e) { e.preventDefault(); }

  function removeFile(id) {
    setFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      if (f?.controller) f.controller.abort();
      return prev.filter(x => x.id !== id);
    });
  }

 async function uploadFile(fileObj) {
    if (fileObj.status === "failed") return;
    const controller = new AbortController();

    setFiles(prev => prev.map(f => (f.id === fileObj.id ? { ...f, status: "uploading", controller, progress: 0 } : f)));

    const fd = new FormData();
    fd.append("video", fileObj.file);
    fd.append("title", fileObj.name);

    try {
      // Get authentication headers
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      const resp = await axios.post(UPLOAD_URL, fd, {
        signal: controller.signal,
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
        onUploadProgress: (pe) => {
          const pct = pe.total ? Math.round((pe.loaded * 100) / pe.total) : 0;
          setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress: pct } : f));
        },
        timeout: 0
      });

      const { videoId } = resp.data;
      // attach server id and set status uploaded
      setFiles(prev => prev.map(f => f.id === fileObj.id ? { 
        ...f, 
        status: "uploaded", 
        progress: 100, 
        controller: null, 
        videoId 
      } : f));

      // join socket.io room named by videoId to receive processing events
      if (socket && videoId) {
        socket.emit('join', videoId);
      }

      return resp.data;
    } catch (err) {
      handleUploadError(err, fileObj.id);
      return null;
    }
  }

  // Separate error handling function for better organization
  function handleUploadError(err, fileId) {
    if (err.name === "CanceledError" || axios.isCancel(err)) {
      setFiles(prev => prev.map(f => f.id === fileId ? { 
        ...f, 
        status: "canceled", 
        controller: null, 
        error: "Canceled" 
      } : f));
    } else if (err.response?.status === 401) {
      // Handle unauthorized error
      setFiles(prev => prev.map(f => f.id === fileId ? { 
        ...f, 
        status: "failed", 
        controller: null, 
        error: "Authentication failed. Please log in again." 
      } : f));
      handleAuthError();
    } else if (err.response?.status === 403) {
      setFiles(prev => prev.map(f => f.id === fileId ? { 
        ...f, 
        status: "failed", 
        controller: null, 
        error: "Access denied." 
      } : f));
    } else {
      const message = err?.response?.data?.message || err.message || "Upload failed";
      setFiles(prev => prev.map(f => f.id === fileId ? { 
        ...f, 
        status: "failed", 
        controller: null, 
        error: message 
      } : f));
    }
  }

  function handleAuthError() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Optionally show a modal or redirect to login
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }
  function uploadAll() {
    files.filter(f => f.status === "queued").forEach(f => uploadFile(f));
  }

  function cancelUpload(id) {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item?.controller) item.controller.abort();
      return prev.map(f => f.id === id ? { ...f, status: "canceled", controller: null } : f);
    });
  }

  function retryUpload(id) {
    const item = files.find(f => f.id === id);
    if (!item) return;
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "queued", progress: 0, error: null } : f));
    setTimeout(() => uploadFile({ ...item, status: 'queued' }), 40);
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload & Real-time Processing Demo</h2>

      <div
        style={styles.uploadBox}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        <input ref={inputRef} type="file" accept="video/*" multiple onChange={handleSelect} style={{ display: "none" }} />
        <div style={{ textAlign: "center" }}>
          <div style={styles.bigIcon}>📁</div>
          <div style={styles.uploadText}>Click to select or drag & drop videos here</div>
          <div style={styles.smallText}>Supported: mp4 / webm / mov / mkv • Max {readableBytes(MAX_FILE_SIZE)}</div>
        </div>
      </div>

      <div style={styles.controls}>
        <button onClick={uploadAll} disabled={!files.some(f => f.status === "queued")}>Upload All</button>
      </div>

      <div style={styles.fileList}>
        {files.length === 0 && <div style={styles.emptyNote}>No files selected yet</div>}

        {files.map((f) => (
          <div key={f.id} style={styles.fileItem}>
            <div style={styles.thumbWrap}>
              <video src={f.preview} style={styles.thumb} muted />
            </div>

            <div style={styles.meta}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 600 }}>{f.name}</div>
                <div style={{ color: "#666", fontSize: 13 }}>{readableBytes(f.size)}</div>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={styles.progressRow}>
                  <div style={styles.progressBar} aria-hidden>
                    <div style={{ ...styles.progressFill, width: `${f.progress}%` }} />
                  </div>
                  <div style={{ marginLeft: 8, minWidth: 50 }}>{f.progress}%</div>
                </div>

                {/* realtime processing info */}
                {f.videoId && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 13 }}>
                      Processing: <strong>{f.processingStage || 'queued'}</strong>
                      {" "}— {f.processingPercent ?? 0}% 
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                <div style={{ fontSize: 13, color: "#444" }}>
                  {f.status === "queued" && <span>Queued</span>}
                  {f.status === "uploading" && <span>Uploading...</span>}
                  {f.status === "uploaded" && <span style={{ color: "green" }}>Uploaded</span>}
                  {f.status === "failed" && <span style={{ color: "red" }}>Failed</span>}
                  {f.status === "canceled" && <span style={{ color: "#999" }}>Canceled</span>}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {f.status === "queued" && <button onClick={() => uploadFile(f)}>Upload</button>}
                  {f.status === "uploading" && <button onClick={() => cancelUpload(f.id)}>Cancel</button>}
                  {f.status === "failed" && <button onClick={() => retryUpload(f.id)}>Retry</button>}
                  <button onClick={() => removeFile(f.id)}>Remove</button>
                </div>
              </div>

              {f.error && <div style={styles.errorText}>{f.error}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { width: "92%", maxWidth: 980, margin: "28px auto", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial" },
  title: { fontSize: 22, marginBottom: 12, textAlign: "center" },
  uploadBox: { border: "2px dashed #cbd5e1", borderRadius: 12, padding: 28, cursor: "pointer", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
  bigIcon: { fontSize: 36, marginBottom: 8 },
  uploadText: { fontSize: 16, fontWeight: 600 },
  smallText: { fontSize: 13, color: "#666", marginTop: 6 },
  controls: { marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" },
  fileList: { marginTop: 18 },
  emptyNote: { color: "#666", padding: 18, textAlign: "center", background: "#fafafa", borderRadius: 8 },
  fileItem: { display: "flex", gap: 12, padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 10, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  thumbWrap: { width: 160, height: 90, overflow: "hidden", borderRadius: 6, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" },
  thumb: { width: "100%", height: "100%", objectFit: "cover" },
  meta: { flex: 1 },
  progressRow: { display: "flex", alignItems: "center", marginTop: 8 },
  progressBar: { height: 8, background: "#eef2ff", borderRadius: 8, overflow: "hidden", flex: 1 },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#34d399,#60a5fa)", width: "0%", transition: "width 0.25s linear" },
  errorText: { color: "#b91c1c", marginTop: 8, fontSize: 13 }
};
