# Base image
FROM ubuntu:latest

# Update the system and install necessary tools
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    golang \
    default-jre \
    default-jdk \
    mono-complete \
    curl \
    gnupg \
    ca-certificates \
    time \
    coreutils \
    bash && \
    update-alternatives --install /usr/bin/python python /usr/bin/python3 1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install the latest version of Node.js (current stable release)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Output versions of installed tools
RUN gcc --version
RUN g++ --version
RUN python3 --version
RUN pip3 --version
RUN go version
RUN java -version
RUN javac -version
RUN mono --version
RUN node --version
RUN npm --version
RUN bash --version

# Build argument for script name (default: run_test.sh)
ARG SCRIPT_NAME=run_test.sh  # Set default if not provided

# Set working directory and copy the script into the container
WORKDIR /app
COPY $SCRIPT_NAME /app/

# Grant execution permissions to the script
RUN chmod +x /app/$SCRIPT_NAME

# Default command to run the script
CMD ["/bin/bash", "-c", "/app/$SCRIPT_NAME"]
