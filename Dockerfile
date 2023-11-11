# 构建阶段
FROM node:lts-alpine AS build-stage
WORKDIR /app
COPY package.json yarn.lock ./
COPY . .
RUN yarn install
RUN yarn build

# 运行阶段
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
