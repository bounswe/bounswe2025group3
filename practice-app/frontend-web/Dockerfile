FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app
RUN npm run build

# Install serve for production static file serving
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Command to run the server
CMD ["serve", "-s", "build", "-l", "3000"]
