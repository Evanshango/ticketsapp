FROM node:alpine

WORKDIR /app
COPY package.json .
RUN npm install --only=prod --silent
COPY . .

CMD ["npm", "start"]
