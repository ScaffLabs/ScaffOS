FROM node:16 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
COPY . .

RUN npm run build

FROM node:16

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

RUN npm install --production

EXPOSE 3000
CMD [ 'node', 'index.js' ]
