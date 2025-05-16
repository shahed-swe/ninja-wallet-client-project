# Use official Node.js LTS image (Debian-based for Ubuntu compatibility)
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (not just production) for build tools, using legacy-peer-deps to resolve conflicts
RUN npm install --legacy-peer-deps

# (Optional) Rebuild native modules
RUN npm rebuild

# Copy the rest of the application code
COPY . .

# Build the application (client and server)
RUN npm run build

# Expose the port the app runs on
EXPOSE 5001

# Set environment variables (override with Docker run -e or .env file)
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
