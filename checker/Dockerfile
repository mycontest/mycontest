FROM node:18

# Install Docker CLI for running docker commands
RUN apt-get update && \
    apt-get install -y docker.io unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy checker package files to root for shared access
COPY checker/package*.json ./

# Install checker dependencies in root
RUN npm install

# Copy all necessary files
COPY checker ./checker
COPY shared ./shared
COPY data ./data

CMD ["node", "checker/worker.js"]
