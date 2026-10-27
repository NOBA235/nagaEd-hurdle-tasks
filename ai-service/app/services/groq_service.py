import json
import re
from typing import List, Optional
from groq import Groq, APITimeoutError, RateLimitError, AuthenticationError, APIError
from fastapi import HTTPException
from app.core.config import settings

class GroqService:
    def __init__(self, client: Optional[Groq] = None):
        self._client = client

    @property
    def client(self) -> Groq:
        if self._client is None:
            api_key = settings.GROQ_API_KEY.strip()
            if not api_key or api_key == "your_groq_api_key_here" or api_key.startswith("gsk_placeholder"):
                raise HTTPException(
                    status_code=503,
                    detail={
                        "code": "GROQ_KEY_UNCONFIGURED",
                        "message": "GROQ_API_KEY is not configured on the AI microservice. Please set a valid key in ai-service/.env."
                    }
                )
            self._client = Groq(api_key=api_key)
        return self._client

    def generate_suggestions(self, interests: List[str]) -> List[str]:
        """
        Calls Groq API to generate exactly 3 creative, distinct usernames based on interests.
        Normalizes and validates output, falling back gracefully on unexpected formats.
        """
        interests_str = ", ".join(interests)

        system_prompt = (
            "You are a creative brand naming assistant. "
            "Generate exactly 3 distinct, creative, catchy, and professional username suggestions "
            "based on the user's interests. "
            "Each username must be clean, alphanumeric, PascalCase or camelCase, between 4 and 18 characters, "
            "and contain no spaces or special symbols. "
            "You must respond strictly with a valid JSON object matching this schema: "
            "{\"suggestions\": [\"NameOne\", \"NameTwo\", \"NameThree\"]}"
        )

        user_prompt = f"User interests: [{interests_str}]. Generate exactly 3 unique username suggestions in JSON."

        try:
            client = self.client
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.8,
                max_tokens=200,
                response_format={"type": "json_object"}
            )

            raw_content = response.choices[0].message.content
            parsed = json.loads(raw_content)

            raw_suggestions = parsed.get("suggestions", [])
            normalized = self._normalize_and_filter(raw_suggestions, interests)

            if len(normalized) == 3:
                return normalized

            # If the LLM returned fewer than 3 valid items, supplement with deterministic fallback
            return self._fill_suggestions(normalized, interests)

        except AuthenticationError:
            raise HTTPException(
                status_code=401,
                detail={
                    "code": "GROQ_AUTH_FAILED",
                    "message": "Authentication failed with the Groq API. Please verify GROQ_API_KEY."
                }
            )
        except RateLimitError:
            raise HTTPException(
                status_code=429,
                detail={
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": "Groq API rate limit reached. Please try again in a few moments."
                }
            )
        except APITimeoutError:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT",
                    "message": "The upstream AI service timed out while generating suggestions."
                }
            )
        except HTTPException:
            raise
        except (json.JSONDecodeError, KeyError, IndexError, APIError):
            # Fallback to algorithmic generation if LLM output is malformed
            return self._generate_fallback_suggestions(interests)

    def _normalize_and_filter(self, names: List[str], interests: List[str]) -> List[str]:
        seen = set()
        cleaned = []
        for name in names:
            if not isinstance(name, str):
                continue
            # Keep only alphanumeric characters
            sanitized = re.sub(r"[^a-zA-Z0-9]", "", name.strip())
            if 3 <= len(sanitized) <= 22 and sanitized.lower() not in seen:
                seen.add(sanitized.lower())
                cleaned.append(sanitized)
            if len(cleaned) == 3:
                break
        return cleaned

    def _fill_suggestions(self, current: List[str], interests: List[str]) -> List[str]:
        fallback_list = self._generate_fallback_suggestions(interests)
        result = list(current)
        seen = {s.lower() for s in result}
        for candidate in fallback_list:
            if candidate.lower() not in seen:
                result.append(candidate)
                seen.add(candidate.lower())
            if len(result) == 3:
                break
        return result[:3]

    def _generate_fallback_suggestions(self, interests: List[str]) -> List[str]:
        """
        Deterministic, creative fallback generator when LLM is unavailable or outputs malformed data.
        """
        prefixes = ["Pixel", "Code", "Byte", "Nova", "Cyber", "Tech", "Echo", "Zenith", "Apex", "Aura"]
        suffixes = ["Craft", "Rhythm", "Dev", "Explorer", "Forge", "Vibe", "Wave", "Flow", "Sync", "Hub"]

        clean_interests = [re.sub(r"[^a-zA-Z]", "", i.capitalize()) for i in interests if re.sub(r"[^a-zA-Z]", "", i)]
        if not clean_interests:
            clean_interests = ["NagaEd", "Builder", "Creator"]

        suggestions = []
        # Pattern 1: Prefix + Interest
        suggestions.append(f"{prefixes[0]}{clean_interests[0]}")
        # Pattern 2: Interest + Suffix
        suggestions.append(f"{clean_interests[-1]}{suffixes[0]}")
        # Pattern 3: Prefix + Suffix or 2nd Interest
        second = clean_interests[1] if len(clean_interests) > 1 else suffixes[1]
        suggestions.append(f"{prefixes[1]}{second}")

        return suggestions[:3]

groq_service = GroqService()

def get_groq_service() -> GroqService:
    return groq_service

