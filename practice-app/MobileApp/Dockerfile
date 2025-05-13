# Use Node.js as base image
FROM node:18-buster-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PORT=19006
ENV NODE_ENV=development
ENV EXPO_DOCKER_BACKEND_URL=http://backend:8000
ENV REACT_NATIVE_BACKEND_URL=http://backend:8000
ENV DEBUG=true 
ENV EXPO_DEBUG=true
ENV EXPO_TUNNEL=true

# Expose Expo ports
EXPOSE 19000 19001 19002 19006 8081

# Install global packages
RUN npm install -g expo-cli

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Install ngrok for tunneling
RUN npm install @expo/ngrok

# Fix SSL issues (optional)
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Command to run the app
CMD ["npx", "expo", "start", "--tunnel", "--no-dev", "--minify"]
