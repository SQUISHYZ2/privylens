# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run expects the container to listen on the port defined by the PORT environment variable
# By default we configure nginx to listen on 8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
