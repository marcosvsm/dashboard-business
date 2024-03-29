# Use the official Node.js image with Node.js v16.15.1 as a base image
FROM node:16.15.1 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vue.js application
RUN npm run build

# Use a lightweight Nginx image to serve the static files
FROM nginx:alpine

# Copy the built files from the previous stage to the Nginx container
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to allow external access
EXPOSE 80

# The Nginx container will start serving the static files automatically
