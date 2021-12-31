FROM node:16-alpine
WORKDIR /app
COPY . .
WORKDIR /app/shared
RUN npm ci
WORKDIR /app/bot
RUN npm ci
CMD ["npm", "start"]
