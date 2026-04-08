FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (if necessary) - uncomment if there's a build step
# RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD [ "node", "index.js" ]
