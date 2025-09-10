ARG REGISTRY_PROXY

### Build graphql
FROM ${REGISTRY_PROXY}inuits/dams-frontend:latest as frontend
FROM node:18-alpine as build-stage


ARG NPM_CONFIG_ALWAYS_AUTH
ARG NPM_CONFIG_REGISTRY
ARG NPM_CONFIG__AUTH_TOKEN
ARG IMAGE_TAG
ENV NPM_CONFIG_ALWAYS_AUTH=false
ENV VERSION=$IMAGE_TAG

RUN adduser --disabled-password --home /app --shell /bin/bash app && corepack enable && corepack prepare pnpm@9.10.0 --activate

### Build graphql
WORKDIR /app/inuits-dams-graphql-service
COPY ./  ./
COPY --from=frontend /app /app/inuits-dams-graphql-service/dashboard
RUN pnpm i --force


RUN mkdir -p /app/schemas
RUN find /app/inuits-dams-graphql-service -type f -name "*.schema.ts" -exec cp -n {} /app/schemas \;
RUN find /app/inuits-dams-graphql-service -type f -name "*.queries.ts" -exec cp -n {} /app/schemas \;
RUN ls /app/schemas

RUN pnpm run generate && pnpm run build

### Customize Elody frontend according to client
WORKDIR /app/inuits-dams-graphql-service/dashboard

RUN rm ./public/logo.svg && rm ./public/favicon.svg && rm ./public/upload-csv-template-asset.csv
COPY /dashboard/client-customization/* ./public/
COPY /dashboard/client-customization/theme.txt /tmp/theme.txt

# --- Start of Theme Color Customization ---
RUN set -e; \
    for var in light normal accent; do \
      new_value=$(grep "color-accent-${var}" /tmp/theme.txt | cut -d ':' -f2- | sed 's/;//' | xargs); \
      sed -i "s|--color-accent-${var}: .*;|--color-accent-${var}: ${new_value};|" ./src/assets/main.css; \
    done
# --- End of Theme Color Customization ---

### Set the pwa version to the image tag
RUN chmod +x /app/inuits-dams-graphql-service/docker/setFrontendVersion.sh
RUN /app/inuits-dams-graphql-service/docker/setFrontendVersion.sh


RUN pnpm i && pnpm run build

### Production stage
FROM node:18-alpine as production-stage

ARG IMAGE_TAG
ARG NPM_CONFIG_ALWAYS_AUTH
ARG NPM_CONFIG_REGISTRY
ARG NPM_CONFIG__AUTH_TOKEN
ENV NPM_CONFIG_ALWAYS_AUTH=false
ENV NODE_ENV=production
ENV VERSION=${IMAGE_TAG}

RUN adduser --disabled-password --home /app --shell /bin/bash app && corepack enable && corepack prepare pnpm@9.10.0 --activate

COPY --from=build-stage /app/inuits-dams-graphql-service/dist ./dist
COPY --from=build-stage /app/inuits-dams-graphql-service/package.json /app/inuits-dams-graphql-service/pnpm-lock.yaml /app/inuits-dams-graphql-service/.npmrc ./
COPY --from=build-stage /app/inuits-dams-graphql-service/dashboard/dist ./dashboard/dist
COPY --from=build-stage /app/inuits-dams-graphql-service/dashboard/package.json ./dashboard

RUN pnpm i --prod

CMD pnpm start

EXPOSE 4001
