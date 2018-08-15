#FROM node:9.11
FROM node:10.8-alpine

# Create app directory
WORKDIR /app

# Copy app source
COPY package.json .
COPY yarn.lock .
COPY ecosystem.config.js .
COPY dist dist/

# from https://github.com/nodejs/docker-node/issues/282#issuecomment-358907790
# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
RUN apk update && apk upgrade \
    && apk --no-cache --virtual build-deps add \
    build-base python2 git make g++ \
    && yarn global add node-gyp node-pre-gyp pm2 \
    && node-gyp clean \
    && yarn cache clean \
    && yarn install --production \
    && apk del build-deps

EXPOSE 3000

# Show current folder structure in logs
RUN ls -al

USER node

CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--web", "3001" ]
