FROM node:22-alpine AS build

# Set the timezone
ENV TZ=Asia/Singapore

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
COPY src ./src
COPY .env ./

RUN npm install

# Expose port
EXPOSE 8080

# Start script
CMD [ "npm", "start" ]
