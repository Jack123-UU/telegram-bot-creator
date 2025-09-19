# TRON Payment Monitor Service
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY payment-monitor/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy payment monitor source
COPY payment-monitor/ .

# Create non-root user
RUN groupadd -r monitor && useradd -r -g monitor monitor
RUN chown -R monitor:monitor /app
USER monitor

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "print('Payment monitor health check')" || exit 1

# Default command
CMD ["python", "tron_monitor.py"]