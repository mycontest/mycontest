# Multi-stage build for optimized checker image
FROM ubuntu:22.04 AS base

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Base system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    gnupg \
    time \
    coreutils \
    bash \
    dos2unix \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Language-specific stage
FROM base AS languages

# Install programming languages
RUN apt-get update && apt-get install -y --no-install-recommends \
    # C/C++
    gcc \
    g++ \
    # Python
    python3 \
    python3-pip \
    # Go
    golang \
    # Java
    default-jre \
    default-jdk \
    # C#
    mono-complete \
    && update-alternatives --install /usr/bin/python python /usr/bin/python3 1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS version)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Final stage
FROM languages

# Create non-root user for security
RUN useradd -m -u 1000 checker && \
    mkdir -p /app/sandbox && \
    chown -R checker:checker /app

WORKDIR /app

# Copy test runner script
ARG SCRIPT_NAME=runner.sh
COPY ${SCRIPT_NAME} /app/runner.sh
RUN dos2unix /app/runner.sh && chmod +x /app/runner.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bash --version || exit 1

# Set resource limits
ENV NODE_OPTIONS="--max-old-space-size=512"

# Version info for debugging
RUN echo "=== Installed Versions ===" && \
    gcc --version | head -1 && \
    g++ --version | head -1 && \
    python3 --version && \
    go version && \
    java -version 2>&1 | head -1 && \
    javac -version 2>&1 && \
    mono --version | head -1 && \
    node --version && \
    npm --version

# Default user
# USER checker

# Default command
CMD ["/bin/bash"]
