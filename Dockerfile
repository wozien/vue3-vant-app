# 重新构建了一个镜像，包含 nginx + nodejs 12.18.3 + yarn 1.22.4
FROM registry.cn-shenzhen.aliyuncs.com/hkky/parrot-nginx-master as YARN_BUILD

RUN mkdir /app
# RUN mkdir /app/nginx
WORKDIR /app
COPY . /app

# 如果在中国环境下构建请把下面注释打开
RUN yarn config set registry https://registry.npm.taobao.org

RUN yarn
# 生产环境
# RUN yarn build
RUN yarn build:uat

RUN rm -rf /app/src
RUN rm -rf /app/node_modules
RUN rm -rf /app/tests

FROM nginx:latest

RUN mkdir /app
WORKDIR /app
COPY --from=YARN_BUILD /app/dist/ /app/dist/
# 用本地的 default.conf 配置来替换 nginx 镜像里的默认配置
COPY default.conf /etc/nginx/conf.d/default.conf
#COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
