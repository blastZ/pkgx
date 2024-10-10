# node v20.13.0, npm v10.5.2
FROM node:20.13.0-alpine@sha256:fac6f741d51194c175c517f66bc3125588313327ad7e0ecd673e161e4fa807f3 AS base

WORKDIR /app

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache bash
RUN apk add --no-cache busybox-extras
RUN apk add --no-cache curl

RUN npm config set registry=https://registry.npmmirror.com \
  && npm install -g pm2

FROM base AS pnpm-env

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm

FROM pnpm-env AS build

COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

ARG APP_NAME

RUN pnpm --filter ${APP_NAME} build

FROM pnpm-env AS app-deps

ARG APP_FOLDER

COPY apps/${APP_FOLDER}/package[s] ./packages
COPY --from=build /app/apps/${APP_FOLDER}/output/package.json ./package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

FROM base AS prod

ENV NODE_ENV=production
ENV APP_ENV=production

COPY --from=app-deps /app/node_modules ./node_modules

ARG APP_FOLDER

COPY --from=build /app/node_modules/@blastz/prisma-clien[t] ./node_modules/@blastz/prisma-client
COPY --from=build /app/apps/${APP_FOLDER}/output/. .

CMD ["pm2-runtime", "--raw", "esm/index.js"]