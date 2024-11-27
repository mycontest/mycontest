FROM node:16

# Create application directory and set ownership
RUN mkdir -p /root/mycontest/node_modules && chown -R node:node /root/mycontest
WORKDIR /root/mycontest

# Copy package.json and install dependencies
COPY package*.json ./
USER root

# Install necessary build tools and programming languages
RUN apt-get update && apt-get install -y build-essential
RUN apt-get update -qq && apt-get install -y -qq python3
RUN apt-get install -y golang
RUN apt-get -y install default-jre && apt install -y default-jdk
RUN apt install -y mono-complete
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 1

# Verify installations
RUN java -version
RUN javac -version
RUN python3 --version
RUN go version
RUN mono --version

# Install dependencies
RUN npm install

# Install PM2 globally
RUN npm install -g pm2

# Copy the rest of the application code and set proper ownership
COPY --chown=node:node . .

# Expose the application port
EXPOSE 1003

# Use PM2 to start the application
CMD ["pm2-runtime", "app.js"]
