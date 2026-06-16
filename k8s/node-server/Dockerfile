FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY main.js ./

EXPOSE 8081 8082

CMD ["node", "main.js"]