from pydantic import BaseModel, Field, field_validator
from typing import List

class SuggestionRequest(BaseModel):
    interests: List[str] = Field(
        ...,
        min_length=1,
        max_length=10,
        description="A list of 1 to 10 user interests (e.g., ['coding', 'music', 'gaming'])"
    )

    @field_validator("interests")
    @classmethod
    def validate_interests(cls, items: List[str]) -> List[str]:
        cleaned = []
        for item in items:
            if not isinstance(item, str) or not item.strip():
                raise ValueError("Each interest must be a non-empty string")
            trimmed = item.strip()
            if len(trimmed) > 50:
                raise ValueError(f"Interest '{trimmed[:20]}...' exceeds maximum length of 50 characters")
            cleaned.append(trimmed)

        if not cleaned:
            raise ValueError("Interests array must contain at least one valid string")

        return cleaned

    model_config = {
        "json_schema_extra": {
            "example": {
                "interests": ["coding", "music", "gaming"]
            }
        }
    }

class SuggestionResponse(BaseModel):
    suggestions: List[str] = Field(
        ...,
        min_length=3,
        max_length=3,
        description="Exactly three distinct, creative username suggestions"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "suggestions": [
                    "CodeMelody",
                    "PixelRhythm",
                    "ByteExplorer"
                ]
            }
        }
    }


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail


