import json
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient
from groq import RateLimitError, AuthenticationError
from app.main import app
from app.services.groq_service import GroqService, get_groq_service

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "nagaed-ai-service"
    assert "model" in data

def test_suggest_username_success_with_mocked_groq():
    """Verify successful username generation using a mocked Groq response (zero paid API calls)."""
    mock_groq_client = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = json.dumps({
        "suggestions": ["CodeMelody", "PixelRhythm", "ByteExplorer"]
    })
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]
    mock_groq_client.chat.completions.create.return_value = mock_response

    mock_service = GroqService(client=mock_groq_client)

    app.dependency_overrides[get_groq_service] = lambda: mock_service

    try:
        response = client.post(
            "/api/suggest-username",
            json={"interests": ["coding", "music", "gaming"]}
        )

        assert response.status_code == 200
        data = response.json()
        assert "suggestions" in data
        assert len(data["suggestions"]) == 3
        assert data["suggestions"] == ["CodeMelody", "PixelRhythm", "ByteExplorer"]
    finally:
        app.dependency_overrides.clear()

def test_suggest_username_validation_empty_array():
    response = client.post("/api/suggest-username", json={"interests": []})
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"

def test_suggest_username_validation_whitespace_string():
    response = client.post("/api/suggest-username", json={"interests": ["   "]})
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"

def test_suggest_username_validation_missing_key():
    response = client.post("/api/suggest-username", json={})
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"

def test_suggest_username_handles_groq_rate_limit():
    """Verify that upstream Groq RateLimitError is gracefully mapped to HTTP 429."""
    mock_groq_client = MagicMock()
    mock_groq_client.chat.completions.create.side_effect = RateLimitError(
        message="Rate limit reached",
        response=MagicMock(status_code=429),
        body={}
    )

    mock_service = GroqService(client=mock_groq_client)
    app.dependency_overrides[get_groq_service] = lambda: mock_service

    try:
        response = client.post(
            "/api/suggest-username",
            json={"interests": ["coding", "design"]}
        )
        assert response.status_code == 429
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "RATE_LIMIT_EXCEEDED"
    finally:
        app.dependency_overrides.clear()

def test_suggest_username_fallback_on_malformed_llm_output():
    """Verify fallback generation when LLM returns unparseable text."""
    mock_groq_client = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = "I am an AI, here are some ideas: non-json-content"
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]
    mock_groq_client.chat.completions.create.return_value = mock_response

    mock_service = GroqService(client=mock_groq_client)
    app.dependency_overrides[get_groq_service] = lambda: mock_service

    try:
        response = client.post(
            "/api/suggest-username",
            json={"interests": ["robotics", "art"]}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["suggestions"]) == 3
        for item in data["suggestions"]:
            assert isinstance(item, str)
            assert len(item) > 2
    finally:
        app.dependency_overrides.clear()

