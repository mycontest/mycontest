FROM node:16

RUN mkdir -p /root/mycontest/node_modules && chown -R node:node /root/mycontest
WORKDIR /root/mycontest

COPY package*.json ./
USER root

RUN apt-get update && apt-get install -y build-essential
RUN apt-get update -qq   && apt-get install -y -qq python3
RUN apt-get install -y golang
RUN alias python=python3.8
RUN apt-get -y install default-jre && apt install -y default-jdk
RUN apt install -y mono-complete 
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3  1
RUN java -version 
RUN javac -version 
RUN python3 --version
RUN go version
RUN mono --version
RUN npm install
COPY --chown=node:node . .
EXPOSE 1003


CMD ["node", "index.js"]
