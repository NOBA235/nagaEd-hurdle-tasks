import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { aiService } from '../services/ai.service';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Inline AI Username Suggestion state
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [interestsInput, setInterestsInput] = useState('coding, music, gaming');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (formData.password.length > 72) {
      newErrors.password = 'Password must not exceed 72 characters';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 2) {
      newErrors.address = 'Address must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleSuggestUsernames = async () => {
    setAiError('');
    const parsedInterests = interestsInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (parsedInterests.length === 0) {
      setAiError('Enter at least one interest (comma-separated).');
      return;
    }

    setAiLoading(true);
    try {
      const results = await aiService.suggestUsernames(parsedInterests);
      setAiSuggestions(results);
    } catch (err) {
      setAiError(err.message || 'Could not reach AI username service.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestedName) => {
    setFormData((prev) => ({ ...prev, username: suggestedName }));
    if (errors.username) {
      setErrors((prev) => ({ ...prev, username: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: formData.address.trim(),
      });

      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { state: { registeredEmail: formData.email.trim() } });
      }, 1500);
    } catch (err) {
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        const mappedErrors = {};
        err.details.forEach((item) => {
          if (item.field) mappedErrors[item.field] = item.message;
        });
        setErrors(mappedErrors);
        setServerError(err.message || 'Please correct the highlighted errors.');
      } else {
        setServerError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create an Account</h2>
          <p>Join the NagaEd Software Developer platform</p>
        </div>

        {serverError && (
          <div className="alert alert-error" role="alert">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="username">Username</label>
              <button
                type="button"
                className="btn-link-ai"
                onClick={() => setShowAiHelper((prev) => !prev)}
              >
                {showAiHelper ? 'Hide AI Helper' : '✨ Suggest with AI'}
              </button>
            </div>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="e.g. noba"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className={errors.username ? 'input-error' : ''}
              autoComplete="username"
            />
            {errors.username && <span className="error-text">{errors.username}</span>}

            {showAiHelper && (
              <div className="inline-ai-panel">
                <label htmlFor="reg-interests" className="inline-ai-label">
                  Your interests (comma-separated)
                </label>
                <div className="inline-ai-input-row">
                  <input
                    id="reg-interests"
                    type="text"
                    value={interestsInput}
                    onChange={(e) => setInterestsInput(e.target.value)}
                    placeholder="coding, music, gaming"
                    disabled={aiLoading}
                  />
                  <button
                    type="button"
                    className="btn-ai-small"
                    onClick={handleSuggestUsernames}
                    disabled={aiLoading}
                  >
                    {aiLoading ? 'Generating...' : 'Generate'}
                  </button>
                </div>
                {aiError && <span className="error-text">{aiError}</span>}
                {aiSuggestions.length > 0 && (
                  <div className="inline-ai-chips">
                    <span className="chips-caption">Click to use:</span>
                    {aiSuggestions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className={`chip-btn ${formData.username === name ? 'chip-active' : ''}`}
                        onClick={() => handleSelectSuggestion(name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. noba@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className={errors.password ? 'input-error' : ''}
              autoComplete="new-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="e.g. Kohima, Nagaland"
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
              className={errors.address ? 'input-error' : ''}
              autoComplete="street-address"
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
