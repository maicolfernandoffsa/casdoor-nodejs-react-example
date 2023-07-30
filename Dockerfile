FROM node:18-alpine AS builder

RUN apk update && apk upgrade && \
    apk add --no-cache git 
RUN mkdir -p /app
WORKDIR /app
COPY ./package.json /app
RUN npm install -g nodemon
RUN npm install --production && npm cache clean --force
COPY ./ /app
ENV NODE_ENV production
RUN npm run build

# Bundle static assets with nginx
FROM nginx:1.21.0-alpine as production
ENV NODE_ENV production
# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html
# Add your nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80
EXPOSE 8080
# Start nginx
CMD ["nginx", "-g", "daemon off;", "node", "server.js"]
