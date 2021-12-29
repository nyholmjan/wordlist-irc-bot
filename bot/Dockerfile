FROM node:15-alpine
WORKDIR /app
COPY . .
WORKDIR /app/shared
RUN npm ci
WORKDIR /app/bot
RUN npm ci
CMD ["npm", "start"]
