FROM node:latest

# Set working directory to the root of your project
WORKDIR /usr/src/AppDir

# Copy dependencies
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]