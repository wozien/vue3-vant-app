FROM nginx:latest

RUN mkdir /app
WORKDIR /app
COPY --from=YARN_BUILD /app/dist/ /app/dist/
# 用本地的 default.conf 配置来替换 nginx 镜像里的默认配置
COPY docker/default.conf /etc/nginx/conf.d/default.conf
#COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
