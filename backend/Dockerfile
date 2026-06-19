FROM python:3.11-slim

WORKDIR /app

# Install dependencies first for better layer caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Run uvicorn, auto-reload disabled for production-like behaviour.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
