FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy payment monitor code
COPY . .

# Copy backend modules for imports
COPY ../backend/tron_client.py ./backend/
COPY ../backend/vault_client.py ./backend/
RUN mkdir -p backend && touch backend/__init__.py

# Health check
HEALTHCHECK --interval=60s --timeout=30s --start-period=10s --retries=3 \
    CMD python -c "import sys; sys.exit(0)" || exit 1

# Run the payment monitor
CMD ["python", "main.py"]