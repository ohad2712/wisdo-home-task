FROM node:14.17

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./


RUN npm install -g node-gyp
RUN npm install -g nodemon

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000
