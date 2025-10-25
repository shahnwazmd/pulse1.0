import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import VideoUploadPage from "./components/videoUploadpage";
import VideoLibrary from "./VideoLibrary";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/useAuth.jsx';  
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState("upload");

  useEffect(() => {
    if (location.pathname === "/upload") setPage("upload");
    if (location.pathname === "/library") setPage("library");
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={loadingStyles}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div>
      <nav style={navStyles.nav}>
        <div style={navStyles.brand}>
          <i className="fas fa-play-circle" style={{ marginRight: '8px' }}></i>
          SecureVideo Space
        </div>
        <div style={navStyles.links}>
          <button 
            onClick={() => { setPage("upload"); navigate("/upload"); }} 
            style={{
              ...navStyles.btn,
              ...(page === "upload" ? navStyles.activeBtn : {})
            }}
          >
            <i className="fas fa-upload" style={{ marginRight: '6px' }}></i>
            Upload
          </button>
          <button 
            onClick={() => { setPage("library"); navigate("/library"); }} 
            style={{
              ...navStyles.btn,
              ...(page === "library" ? navStyles.activeBtn : {})
            }}
          >
            <i className="fas fa-video" style={{ marginRight: '6px' }}></i>
            Library
          </button>
        </div>
        <div style={navStyles.userSection}>
          <span style={navStyles.userInfo}>
            <i className="fas fa-user" style={{ marginRight: '6px' }}></i>
            {user.name}
          </span>
          <button onClick={handleLogout} style={navStyles.logoutBtn}>
            <i className="fas fa-sign-out-alt" style={{ marginRight: '6px' }}></i>
            Logout
          </button>
        </div>
      </nav>

      <main style={{ paddingTop: 16 }}>
        <Routes>
          <Route path="/upload" element={<VideoUploadPage />} />
          <Route path="/library" element={<VideoLibrary />} />
          <Route path="/" element={<Navigate to="/upload" />} />
          <Route path="*" element={<Navigate to="/upload" />} />
        </Routes>
      </main>
    </div>
  );
}

const navStyles = {
  nav: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "12px 24px", 
    borderBottom: "1px solid #eee", 
    background: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  brand: { 
    fontWeight: 700, 
    fontSize: "1.25rem",
    color: "#2563eb",
    display: "flex",
    alignItems: "center"
  },
  links: { 
    display: "flex", 
    gap: 8 
  },
  btn: { 
    padding: "8px 16px", 
    cursor: "pointer", 
    borderRadius: 6, 
    border: "1px solid #ddd", 
    background: "#fff",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s"
  },
  activeBtn: {
    background: "#2563eb",
    color: "white",
    borderColor: "#2563eb"
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  userInfo: {
    color: "#64748b",
    fontSize: "0.9rem"
  },
  logoutBtn: {
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: 6,
    border: "1px solid #dc2626",
    background: "#fff",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    fontSize: "0.9rem"
  }
};

const loadingStyles = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  fontSize: "1.2rem",
  color: "#64748b"
};