FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the TypeScript files
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD [ "node", "dist/index.js" ]

# Setting up environment variables
ENV NODE_ENV=${NODE_ENV}
ENV BASE_URL=${BASE_URL}
ENV PORT=${PORT}
ENV DB_USER=${DB_USER}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_HOST=${DB_HOST}
ENV DB_NAME=${DB_NAME}
ENV DB_PORT=${DB_PORT}
ENV LOG_LEVEL=${LOG_LEVEL}
ENV DOCKER=${DOCKER}