FROM node:18

# Install Docker CLI to allow running docker commands from within the container
RUN apt-get update && \
    apt-get install -y docker.io unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
