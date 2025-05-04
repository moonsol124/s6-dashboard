# Stage 1: Development Environment
FROM node:18-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Set API URL environment variable (optional)
ARG REACT_APP_API_URL=http://localhost:3002/api
ENV VITE_API_URL=$REACT_APP_API_URL

CMD ["npm", "run", "dev"]