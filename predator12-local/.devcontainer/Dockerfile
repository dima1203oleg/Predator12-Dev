# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/devcontainers/python:3.11

# Install system packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    build-essential \
    libpq-dev \
    redis-tools \
    # Install Ollama
    && curl -fsSL https://ollama.com/install.sh | sh

# Set up Ollama
RUN ollama pull mistral

# Set up the vscode user and permissions
USER vscode

# Set default shell to zsh if available, otherwise bash
SHELL ["/bin/zsh", "-c"]

# Set environment variables for Python and Node.js
ENV PATH="/usr/local/bin:${PATH}"
ENV PATH="/usr/local/sbin:${PATH}"

# Install Node.js 18 (if not already handled by devcontainer.json features)
# The devcontainer.json features should handle this, but as a fallback:
# RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
#     && apt-get install -y nodejs

# Install other necessary tools if any
# RUN apt-get update && apt-get install -y ...

# Clean up apt cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
