FROM node:18-alpine

# Install Python (used by the judge) and dependencies for code execution
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

EXPOSE 7001

# Default command (overridden by docker-compose for dev)
CMD ["node", "src/server.js"]
