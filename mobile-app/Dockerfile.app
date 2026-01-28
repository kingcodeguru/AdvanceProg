FROM node:latest

# Set working directory to the root of your project
WORKDIR /usr/src/AppDir

# Copy dependencies
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8081

CMD ["npx", "expo", "start"]