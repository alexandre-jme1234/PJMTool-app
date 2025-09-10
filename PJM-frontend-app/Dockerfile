# Stage 1
ARG NODE_VERSION=22.14.0-alpine
FROM node:${NODE_VERSION}

RUN mkdir -p /app

WORKDIR /app
COPY package.json /app

RUN npm install
RUN npm install dotenv --silent
RUN npm install -g @angular/cli@17.0.2

COPY . /app

EXPOSE 4200

CMD ["npm", "start"]


