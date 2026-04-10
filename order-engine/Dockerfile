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

# Environment variables support
ENV NODE_ENV=production
ENV PORT=${PORT}
ENV BASE_URL=${BASE_URL}
ENV DATABASE_URL=${DATABASE_URL}
ENV ANOTHER_SERVICE_URL=${ANOTHER_SERVICE_URL}
ENV ORDER_SERVICE_URL=${ORDER_SERVICE_URL}
ENV MEMORY_LIMIT=${MEMORY_LIMIT}
ENV LOG_LEVEL=${LOG_LEVEL}

CMD [ "node", "dist/index.js" ]
