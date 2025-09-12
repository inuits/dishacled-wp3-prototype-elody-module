import { Environment, getRoutesObject } from "base-graphql";
import { dishacledRoutes } from "./dishacledRoutes";
import { Entitytyping } from "../generated-types/type-defs";

const defaultPort = 4000;

export const dishacledAppConfig: Environment = {
  apollo: {
    graphqlPath: process.env.APOLLO_GRAPHQL_PATH || "/api/graphql",
    introspection: process.env.APOLLO_INTROSPECTION === "true",
    playground: process.env.APOLLO_PLAYGROUND === "true",
    tokenLogging: process.env.APOLLO_TOKENLOGGING || "false",
  },
  port: process.env.PORT || defaultPort,
  environment: process.env.NODE_ENV || "development",
  sessionSecret: process.env.APOLLO_SESSION_SECRET || "",
  version: process.env.VERSION || "development-version",
  clientSecret:
    process.env.APOLLO_CLIENT_SECRET || "b369418d-efbb-4b7e-9a3f-894d72842284",
  oauth: {
    baseUrl:
      process.env.OAUTH_BASE_URL || "http://keycloak:8080/auth/realms/dams",
    baseUrlFrontend:
      process.env.OAUTH_BASE_URL_FRONTEND ||
      "http://keycloak.dams.localhost:8100/auth/realms/dams",
    clientId: process.env.OAUTH_CLIENT_ID || "dams-dashboard",
    tokenEndpoint:
      process.env.OAUTH_TOKEN_ENDPOINT || "/protocol/openid-connect/token",
    logoutEndpoint:
      process.env.OAUTH_LOGOUT_ENDPOINT || "/protocol/openid-connect/logout",
    authEndpoint:
      process.env.OAUTH_AUTH_ENDPOINT || "/protocol/openid-connect/auth",
    apiCodeEndpoint: process.env.OAUTH_API_CODE_ENDPOINT || "/api/auth_code",
  },
  api: {
    promUrl: "",
    collectionApiUrl:
      process.env.COLLECTION_API_URL || "http://collection-api:8000",
    searchApiUrl: process.env.SEARCH_API_URL || "http://search-api:8002",
    csvImportServiceUrl:
      process.env.CSV_IMPORTER_URL || "http://dams-csv-import-service:8003",
    fileSystemImporterServiceUrl:
      process.env.FILE_SYSTEM_IMPORTER_URL ||
      "http://filesystem-importer-service:5000",
    iiifUrl: process.env.IMAGE_API_URL || "http://cantaloupe:8182/iiif/image",
    iiifUrlFrontend:
      process.env.IMAGE_API_URL_EXT || "http://localhost:8182/iiif/image",
    storageApiUrl:
      process.env.STORAGE_API_URL || "http://storage-api.dams.localhost:8100/",
    storageApiUrlExt:
      process.env.STORAGE_API_URL_EXT ||
      "http://storage-api.dams.localhost:8100/",
    transcodeService:
      process.env.TRANSCODE_SERVICE_URL || "http://transcode-service:5000/",
  },
  db: {
    mongodb: {
      username: process.env.MONGODB_USERNAME || undefined,
      password: process.env.MONGODB_PASSWORD || undefined,
      port: process.env.MONGODB_PORT || "27017",
      hostname: process.env.MONGODB_HOSTS || "mongo",
      dbName: process.env.MONGODB_DB_NAME || "dishacled-wp3-prototype",
    },
  },
  customization: {
    applicationTitle: process.env.APPLICATION_TITLE || "Dishacled",
    applicationLocale: "en",
    uploadEntityTypeToCreate: Entitytyping.Asset,
    entityIdKey: "_id",
  },
  features: {
    hasTenantSelect: false,
    hideSuperTenant: true,
    SEO: {
      hasSEO: false,
    },
    simpleSearch: {
      hasSimpleSearch: false,
    },
    hasSavedSearch: true,
  },
  allowAnonymousUsers:
    process.env.ALLOW_ANONYMOUS_USERS?.toLowerCase() === "true",
  routerConfig: getRoutesObject(dishacledRoutes),
  bulkSelectAllSizeLimit: 100,
  damsFrontend:
    process.env.DAMS_FRONTEND_URL || "http://dashboard.dams.localhost:8100",
  graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || "/api/graphql",
  staticToken: process.env.STATIC_JWT || undefined,
  sentryEnabled: process.env.SENTRY_ENABLED === "true",
  sentryDsn: process.env.SENTRY_DSN || "",
  sentryDsnFrontend: process.env.SENTRY_DSN_FRONTEND || "",
  nomadNamespace: process.env.NOMAD_NAMESPACE || "",
  ignorePermissions: false,
  maxUploadSize: Number(process.env.MAX_UPLOAD_SIZE) || 250 * 1024000,
};
