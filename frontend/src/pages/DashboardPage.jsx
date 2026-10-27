import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch fresh profile data from protected GET /api/users/:id on mount
  useEffect(() => {
    let isMounted = true;

    async function loadFreshProfile() {
      if (!user?.id) return;
      setLoading(true);
      setError('');
      try {
        const freshData = await refreshProfile();
        if (isMounted && freshData) {
          setProfile(freshData);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message ||
              'Could not refresh profile from server. Displaying cached session.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFreshProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <div className="dashboard-container">
      {/* Top Banner */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <h1>
            Welcome back, <span className="highlight">{profile?.username || 'Developer'}</span>!
          </h1>
          <p>You are authenticated via JWT Bearer Token to the NagaEd API.</p>
        </div>
        <button onClick={logout} className="btn-secondary" type="button">
          Log Out
        </button>
      </section>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Profile Details Card */}
      <div className="dashboard-grid">
        <div className="card profile-card">
          <div className="card-header">
            <h3>Verified User Profile</h3>
            <span className="badge badge-success">Active Session</span>
          </div>
          <div className="card-body">
            {loading ? (
              <p className="loading-text">Refreshing user record from MySQL...</p>
            ) : (
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">User ID:</span>
                  <span className="detail-value">{profile?.id ?? 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Username:</span>
                  <span className="detail-value font-medium">{profile?.username}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{profile?.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Registered Address:</span>
                  <span className="detail-value">{profile?.address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Security State:</span>
                  <span className="detail-value text-muted">
                    Password hash strictly omitted from query and response
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Username Suggestions Section (Ready for Task 3 integration) */}
        <div className="card ai-card">
          <div className="card-header">
            <h3>AI Username Generator</h3>
            <span className="badge badge-ai">FastAPI + Groq</span>
          </div>
          <div className="card-body">
            <p className="ai-description">
              Generate creative usernames based on your personal interests powered by
              our Groq-accelerated AI microservice.
            </p>
            <div className="ai-placeholder">
              <span className="ai-status-indicator">●</span>
              <span>FastAPI microservice endpoint (`/api/suggest-username`) integration ready for Phase 3.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

