FROM node:16-alpine

RUN apk add gcompat

WORKDIR /app/

ADD . /app/
RUN npm ci --prefix /app/

ENTRYPOINT [ "/app/docker/entrypoint.sh" ]
