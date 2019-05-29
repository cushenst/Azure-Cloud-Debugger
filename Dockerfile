FROM node:10.15.3


WORKDIR /usr/src/app


COPY package*.json ./
RUN npm install

EXPOSE 8080
EXPOSE 1337

COPY . .

CMD [ "npm", "start" ]

