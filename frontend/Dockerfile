# Use Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Build production-ready files
RUN npm run build

# Install serve to host built files
RUN npm install -g serve

# Expose React app port
EXPOSE 3000

# Command to serve built app
CMD ["serve", "-s", "build", "-l", "3000"]
