# Use official Node.js image as build environment
FROM node:20-alpine AS builder

WORKDIR /app

# Accept the variable at build time
ARG VITE_API_URL

# Make it available to Vite as an environment variable
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --mode production

# Use nginx to serve the built files
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
