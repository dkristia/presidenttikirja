FROM node:16.17.1-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src ./src
COPY public ./public
COPY vite.config.ts ./
COPY tsconfig.node.json ./
COPY index.html ./

RUN npm run build

FROM nginx:1.23.1-alpine as production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80