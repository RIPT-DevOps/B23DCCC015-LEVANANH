FROM node:20.11.1

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]


