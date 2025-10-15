FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g typescript

COPY . .

RUN npm run build

FROM node:20-slim

ARG AUTH_SECRET
ARG IDT_PUBLIC
ARG IDT_SECRET
ARG ZT_NETWORK

ENV AUTH_SECRET=${AUTH_SECRET}
ENV IDT_PUBLIC=${IDT_PUBLIC}
ENV IDT_SECRET=${IDT_SECRET}
ENV ZT_NETWORK=${ZT_NETWORK}

RUN apt-get update && \
    apt-get install -y curl iproute2 iputils-ping net-tools && \
    rm -rf /var/lib/apt/lists/*

RUN curl -s https://install.zerotier.com | bash

VOLUME /var/lib/zerotier-one

WORKDIR /app

COPY package*.json ./

RUN npm install --production
RUN echo "${AUTH_SECRET}" > /var/lib/zerotier-one/authtoken.secret
RUN echo "${IDT_PUBLIC}" > /var/lib/zerotier-one/identity.public
RUN echo "${IDT_SECRET}" > /var/lib/zerotier-one/identity.secret

COPY --from=build /app/.env ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/config.json ./
COPY --from=build /app/config-backup.json ./

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
