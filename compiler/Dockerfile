# Use Node.js 16 as the base image
FROM node:16

# Set the working directory
WORKDIR /root/mycontest

# Copy only package.json files to install dependencies
COPY package*.json ./

# Install necessary build tools and dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    golang \
    default-jre \
    default-jdk \
    mono-complete && \
    update-alternatives --install /usr/bin/python python /usr/bin/python3 1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Node.js dependencies
RUN npm install

# Install PM2 globally
RUN npm install -g pm2

# Expose the application port
EXPOSE 1003

# Command to run the application
CMD ["pm2-runtime", "app.js"]