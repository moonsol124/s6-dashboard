# crud-dashboard/Dockerfile (Multi-stage Build for Production)

# ---- Build Stage ----
# Use a specific Node version, Alpine for smaller size
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci # Use ci for clean, consistent installs based on lock file

# Copy the rest of the application source code
COPY . .

# Build the static assets for production
# Vite reads VITE_ variables from .env files by default during build
# Ensure your .env or .env.production has the correct VITE_API_GATEWAY_URL etc.
# pointing to your *external* Ingress/Gateway address (e.g., http://my-app.local)
# Alternatively, pass build args if configured in GitHub Actions
RUN echo ">>> Building static assets..." && \
    npm run build && \
    echo ">>> Build complete. Files in /app/dist:" && \
    ls -l /app/dist

# ---- Production Stage ----
# Use a lightweight Nginx image
FROM nginx:1.25-alpine

# Remove default Nginx welcome page
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration for SPAs
# Assumes nginx.conf is in the same directory as the Dockerfile
COPY nginx.conf /etc/nginx/conf.d/custom-app.conf

# Copy built static assets from the 'builder' stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Nginx default port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]