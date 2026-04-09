FROM node:14 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:14

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
RUN npm install --only=production

# Set environment variables for Docker
ENV PORT=3000
ENV NODE_ENV=production
ENV ORDER_SERVICE_URL=http://order_service:4000
ENV DATA_SERVICE_URL=http://data_service:5000
ENV DATABASE_URL=sqlite://:memory:
ENV LOG_LEVEL=info

EXPOSE 3000
CMD [ "node", "dist/index.js" ]
