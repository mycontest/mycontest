FROM node:18-alpine

# Install Python and dependencies for code execution
RUN apk add --no-cache python3 py3-pip

# Create app directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY server/ .

# Create temp directory for code execution
RUN mkdir -p temp

# Expose port
EXPOSE 7001

# Start application
CMD ["node", "app.js"]
