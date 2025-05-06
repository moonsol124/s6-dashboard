# Dockerfile for frontend (using Vite Dev Server - DEVELOPMENT ONLY)

# Use an official Node.js runtime
FROM node:18-alpine as base

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install ALL dependencies (including devDependencies like 'vite')
RUN npm install

# Copy the rest of the application source code
# This needs to happen AFTER npm install if you have local dependencies/links
COPY . .

# --- IMPORTANT: Vite Dev Server Configuration ---
# 1. Make sure Vite listens on 0.0.0.0 to be accessible outside the container.
#    Ensure your package.json's "dev" script includes '--host':
#    "scripts": { "dev": "vite --host", ... }
# 2. If you need VITE_ environment variables at runtime (less common, usually build time),
#    you would handle them via K8s ConfigMap/Secrets and an entrypoint script.
#    For now, we assume VITE_ vars are handled at build time or not needed runtime.

# Expose the Vite default port
EXPOSE 5173

# Command to run the Vite dev server
CMD ["npm", "run", "dev"]