FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Define build arguments for environment variables
ARG REACT_APP_API_URL
ARG REACT_APP_SITE_URL
ARG REACT_APP_GCP_CLIENT_ID
ARG REACT_APP_GITHUB_CLIENT_ID

# Set them as environment variables for the build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SITE_URL=$REACT_APP_SITE_URL
ENV REACT_APP_GCP_CLIENT_ID=$REACT_APP_GCP_CLIENT_ID
ENV REACT_APP_GITHUB_CLIENT_ID=$REACT_APP_GITHUB_CLIENT_ID

# Build the React app (now with environment variables)
RUN npm run build

# Install serve for production static file serving
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Command to run the server
CMD ["serve", "-s", "build", "-l", "3000"]
