FROM node:alpine:10

USER node

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_ENV development

WORKDIR /home/node/app

COPY package* ./

RUN apk add --no-cache libc6-compat

RUN npm install

COPY . .

CMD [ "npm", "start" ]

EXPOSE 8443

