FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json

RUN npm install -w backend

COPY backend ./backend

WORKDIR /app/backend

EXPOSE 4000

CMD ["npm", "run", "docker:start"]
