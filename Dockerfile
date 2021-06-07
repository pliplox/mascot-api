FROM node:15

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN yarn install

# Bundle app source
COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
