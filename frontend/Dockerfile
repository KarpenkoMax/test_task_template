FROM node:20-alpine

WORKDIR /app

# Кешируем зависимости
COPY package*.json ./
RUN npm ci || npm install

COPY . .
