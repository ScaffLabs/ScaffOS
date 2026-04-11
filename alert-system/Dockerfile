FROM node:16 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
COPY . .

RUN npm run build # Assuming there's a build script for TypeScript compilation

FROM node:16

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

# Install dotenv for loading environment variables
RUN npm install dotenv

EXPOSE 3000
CMD [ 'npm', 'start' ]