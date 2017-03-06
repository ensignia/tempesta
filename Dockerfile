#FROM node:7.2.1-alpine
FROM finanzcheck/docker-node-java:6.9-alpine

# Copy application files
COPY ./build /usr/src/app
WORKDIR /usr/src/app

RUN mkdir /usr/src/app/data
RUN chown -R node:node /usr/src/app

# Install Node.js dependencies
RUN npm install --production

VOLUME [ "/usr/src/app/data" ]

CMD [ "node", "server.js" ]
