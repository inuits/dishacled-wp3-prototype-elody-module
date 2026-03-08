# --------------------------------------------------------------
# Build stage
# --------------------------------------------------------------
FROM ${REGISTRY_PROXY}inuits/dams-frontend:latest as frontend
FROM node:18-bookworm-slim as build-stage

ARG IMAGE_TAG
ENV NPM_CONFIG_ALWAYS_AUTH=false
ENV VERSION=${IMAGE_TAG}

RUN apt-get update && apt-get install -y curl bash && rm -rf /var/lib/apt/lists/* && adduser --disabled-password --home /app --shell /bin/bash app
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate
RUN curl -fsSL https://bun.sh/install | bash && ln -s /root/.bun/bin/bun /usr/local/bin/bun

### Setup graphql service
WORKDIR /app/inuits-dams-graphql-service
COPY ./  ./
COPY --from=frontend /app /app/inuits-dams-graphql-service/dashboard
# Mount NPM_CONFIG_REGISTRY, NPM_CONFIG__AUTH_TOKEN as build secrets
RUN --mount=type=secret,id=NPM_CONFIG_REGISTRY,uid=1000 \
    --mount=type=secret,id=NPM_CONFIG__AUTH_TOKEN,uid=1000 \
    export NPM_CONFIG_REGISTRY=$(cat /run/secrets/NPM_CONFIG_REGISTRY) && \
    export NPM_CONFIG__AUTH_TOKEN=$(cat /run/secrets/NPM_CONFIG__AUTH_TOKEN) && \
    pnpm i --force

RUN mkdir -p /app/schemas
RUN find /app/inuits-dams-graphql-service -type f -name "*.schema.ts" -exec cp -n {} /app/schemas \;
RUN find /app/inuits-dams-graphql-service -type f -name "*.queries.ts" -exec cp -n {} /app/schemas \;
RUN ls /app/schemas

# Generate GraphQL types (no webpack build needed — Bun runs TypeScript directly)
RUN pnpm run generate

# Extract GraphQL document nodes into documents.json
RUN bun /app/inuits-dams-graphql-service/docker/extract-documents.ts \
    /app/inuits-dams-graphql-service/dashboard/src/generated-types/queries.ts \
    /app/inuits-dams-graphql-service/documents.json

### Customize Elody frontend according to client
WORKDIR /app/inuits-dams-graphql-service/dashboard

RUN rm -f ./public/logo.svg ./public/favicon.svg ./public/upload-csv-template-asset.csv
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
RUN if [ -f /app/inuits-dams-graphql-service/docker/setFrontendVersion.sh ]; then \
      chmod +x /app/inuits-dams-graphql-service/docker/setFrontendVersion.sh && \
      /app/inuits-dams-graphql-service/docker/setFrontendVersion.sh; \
    fi

RUN pnpm i && pnpm run build


# --------------------------------------------------------------
# Production stage
# --------------------------------------------------------------
FROM node:18-bookworm-slim as production-stage

ARG IMAGE_TAG
ENV NODE_ENV=production
ENV VERSION=${IMAGE_TAG}

RUN apt-get update && apt-get install -y curl bash && rm -rf /var/lib/apt/lists/* && adduser --disabled-password --home /app --shell /bin/bash app
RUN curl -fsSL https://bun.sh/install | bash && ln -s /root/.bun/bin/bun /usr/local/bin/bun

WORKDIR /app/inuits-dams-graphql-service

# GraphQL server TypeScript source (Bun runs it directly, no compilation)
COPY --from=build-stage /app/inuits-dams-graphql-service/src ./src
COPY --from=build-stage /app/inuits-dams-graphql-service/package.json ./
COPY --from=build-stage /app/inuits-dams-graphql-service/tsconfig.json ./

# Modules + generated-types needed at runtime
COPY --from=build-stage /app/inuits-dams-graphql-service/modules ./modules
COPY --from=build-stage /app/inuits-dams-graphql-service/generated-types ./generated-types
COPY --from=build-stage /app/inuits-dams-graphql-service/node_modules ./node_modules

# Compiled frontend (served by Express)
COPY --from=build-stage /app/inuits-dams-graphql-service/dashboard/dist ./dashboard/dist

# GraphQL document nodes for /api/documents endpoint
COPY --from=build-stage /app/inuits-dams-graphql-service/documents.json ./documents.json

USER app

ENTRYPOINT []
CMD ["bun", "src/main.ts"]

EXPOSE 4001
