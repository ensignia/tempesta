#FROM node:7.2.1-alpine
FROM finanzcheck/docker-node-java:6.9-alpine

# Copy application files
COPY ./build /usr/src/app
WORKDIR /usr/src/app

# Install Node.js dependencies
RUN npm install --production

CMD [ "node", "server.js" ]
