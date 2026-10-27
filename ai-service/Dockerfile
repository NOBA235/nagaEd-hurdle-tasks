# Stage 1: Build and install Python dependencies into an isolated prefix
FROM python:3.13-slim AS builder

WORKDIR /build
COPY requirements.txt ./
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Minimal production runtime image
FROM python:3.13-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy pre-installed site-packages and scripts from builder stage
COPY --from=builder /install /usr/local

# Copy application source code
COPY app/ ./app/

# Run as non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
