import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Your secure video management dashboard</p>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-upload"></i>
          </div>
          <h3>Upload Videos</h3>
          <p>Securely upload your video content with end-to-end encryption</p>
          <Link to="/upload" className="card-button">Upload Now</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-video"></i>
          </div>
          <h3>My Library</h3>
          <p>Access your personal video collection with strict user isolation</p>
          <Link to="/library" className="card-button">View Library</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h3>Security Features</h3>
          <p>Your data is completely segregated from other users</p>
          <div className="security-list">
            <div className="security-item">
              <i className="fas fa-check"></i>
              <span>User Isolation</span>
            </div>
            <div className="security-item">
              <i className="fas fa-check"></i>
              <span>Data Segregation</span>
            </div>
            <div className="security-item">
              <i className="fas fa-check"></i>
              <span>Secure Streaming</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;