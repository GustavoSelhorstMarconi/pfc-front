# Build stage
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

# VITE_API_BASE_URL uses a relative path so Nginx can proxy it
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build-only

# Runtime stage
FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
