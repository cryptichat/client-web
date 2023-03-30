FROM docker.io/library/node:19-alpine as builder
COPY package*.json /code/
WORKDIR /code
RUN npm ci --only=production
COPY . /code
RUN npm run build

FROM docker.io/library/nginx:alpine
COPY --from=builder /code/build /usr/share/nginx/html
