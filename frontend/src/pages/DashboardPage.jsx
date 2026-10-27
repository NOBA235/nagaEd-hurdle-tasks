import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { aiService } from '../services/ai.service';

export default function DashboardPage() {
  const { user, logout, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI Username Generator state
  const [interestsInput, setInterestsInput] = useState('coding, music, gaming');
  const [suggestions, setSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [copiedItem, setCopiedItem] = useState(null);

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
  }, [user?.id, refreshProfile]);

  // Handle AI Username Generation
  const handleGenerateSuggestions = async (e) => {
    e.preventDefault();
    setAiError('');

    const parsedInterests = interestsInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (parsedInterests.length === 0) {
      setAiError('Please enter at least one interest separated by commas.');
      return;
    }

    setAiLoading(true);
    try {
      const results = await aiService.suggestUsernames(parsedInterests);
      setSuggestions(results);
    } catch (err) {
      setAiError(err.message || 'Failed to generate suggestions from AI microservice.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = (name) => {
    navigator.clipboard?.writeText(name);
    setCopiedItem(name);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <div className="dashboard-container">
      {/* Top Banner */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <h1>
            Welcome back, <span className="highlight">{profile?.username || 'Developer'}</span>!
          </h1>
          <p>Authenticated session connected to Node.js & MySQL backend.</p>
        </div>
        <button onClick={logout} className="btn-secondary" type="button">
          Sign Out
        </button>
      </section>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Profile Card */}
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
                  <span className="detail-label">Password Hash:</span>
                  <span className="detail-value text-muted">
                    Excluded from query projection & response DTO
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Username Generator Card */}
        <div className="card ai-card">
          <div className="card-header">
            <h3>AI Username Generator</h3>
            <span className="badge badge-ai">FastAPI + Groq</span>
          </div>
          <div className="card-body">
            <p className="ai-description">
              Enter your hobbies or topics of interest below to generate 3 unique,
              catchy usernames powered by the Groq-accelerated AI microservice.
            </p>

            <form onSubmit={handleGenerateSuggestions} className="ai-form">
              <div className="form-group">
                <label htmlFor="interests">Interests (comma-separated)</label>
                <input
                  id="interests"
                  type="text"
                  placeholder="e.g. coding, music, gaming"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  disabled={aiLoading}
                />
              </div>

              <button
                type="submit"
                disabled={aiLoading}
                className="btn-ai"
              >
                {aiLoading ? (
                  <span className="spinner-label">
                    <span className="spinner"></span> Generating Names...
                  </span>
                ) : (
                  'Generate 3 Suggestions'
                )}
              </button>
            </form>

            {aiError && (
              <div className="alert alert-error ai-alert" role="alert">
                {aiError}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="suggestions-container">
                <h4>Suggested Usernames:</h4>
                <div className="suggestions-list">
                  {suggestions.map((name, idx) => (
                    <div key={idx} className="suggestion-item">
                      <span className="suggestion-name">{name}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(name)}
                        className="btn-copy"
                        title="Copy to clipboard"
                      >
                        {copiedItem === name ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
