# ==========================================
# DEVELOPMENT CONTAINER
# Full-featured dev environment
# ==========================================

FROM mcr.microsoft.com/devcontainers/python:3.11-bullseye

# Install system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        # Build essentials
        build-essential \
        curl \
        wget \
        git \
        vim \
        # Database clients
        postgresql-client \
        redis-tools \
        # Network tools
        netcat \
        iputils-ping \
        telnet \
        dnsutils \
        # Kubernetes tools
        kubectl \
        # Other tools
        jq \
        yq \
        make \
        unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Install Helm
RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install ArgoCD CLI
RUN curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64 \
    && chmod +x /usr/local/bin/argocd

# Install Docker Compose
RUN curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose

# Install Python tools
RUN pip install --no-cache-dir \
    black \
    isort \
    flake8 \
    pylint \
    mypy \
    bandit \
    pytest \
    pytest-cov \
    pre-commit \
    ipython \
    ipdb

# Set up workspace
WORKDIR /workspace

# Configure Git
RUN git config --global --add safe.directory /workspace

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PATH="/workspace/.local/bin:${PATH}"

# Create vscode user
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

USER $USERNAME

# Install user-level tools
RUN pip install --user \
    httpie \
    pgcli \
    mycli

CMD ["sleep", "infinity"]
