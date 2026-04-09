FROM node:14 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build

FROM node:14
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
RUN npm install --production

CMD [ "node", "dist/index.js" ]

# Add environment variables support
ENV NODE_ENV=production
