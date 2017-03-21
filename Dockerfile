FROM node:argon

# Create app directory
RUN mkdir -p /opt/extensiblesparkbot

# Install app dependencies
COPY package.json /opt/extensiblesparkbot/

# Bundle app source
COPY /extensiblesparkbot/ /opt/extensiblesparkbot/

WORKDIR /opt/extensiblesparkbot

RUN npm install

EXPOSE 80
EXPOSE 443
 
CMD [ "node", "worker.js" ]

