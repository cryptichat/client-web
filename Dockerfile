FROM docker.io/library/node:19 as builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json /code/
WORKDIR /code
RUN npm ci --legacy-peer-deps
COPY . /code
RUN npm run build

FROM docker.io/library/nginx:alpine
COPY ci/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /code/build /var/www/html
