<p align="center">
  <a href="https://elody.eu"><img src="https://elody.eu/images/logo.svg" alt="Elody" width="96" /></a>
</p>

<p align="center">Part of <a href="https://elody.eu">Elody</a> — the open semantic data platform.<br /><a href="https://docs.elody.eu">Documentation</a> · <a href="https://elody.eu">Website</a></p>

# DISHACLED WP3 prototype Elody module

The client-side GraphQL service for the DISHACLED WP3 prototype. It extends `base-graphql` with the prototype's own schema, routes, forms, permissions and translations — the GraphQL layer the PWA talks to.

Schema and configuration only: no custom data sources (`dataSources: {}`) and no custom Express endpoints. All persistence goes through the base `CollectionAPI` data source to collection-api.

## What's included

| Layer | What it adds |
|-------|-------------|
| Modules wired in | `mediafile-module`, `advanced-filter-module`, `saved-search-module`, plus its own `dishacledModule` |
| Entity types | `pipeline`, `channel`, `processor` (`pyLogProcessor`, `tsHttpUtilsProcessor`, `jvmRmlProcessor`), `runner` (`jsRunner`, `jvmRunner`, `pyRunner`), `user`, `tenant` |
| Input fields | `BaseFieldType.hasWriterField`, plus the form definitions in `src/sources/forms.ts` |
| Routes | `src/dishacledRoutes.ts` — processors as the home overview, with pipelines, runners, channels and users alongside |
| Permissions | `src/dishacledPermissions.ts` — dry-run CollectionAPI calls per entity type, including relation checks against `$parentEntityId` |
| Mappings | `customTypeCollectionMapping`, `customTypePillLabelMapping` (`src/sources/`) |
| Translations | `src/translations/{en,nl}.json` |

## Layout

```
src/
  main.ts                    # boots base-graphql with the config below
  dishacledModule.ts         # graphql-modules module (schema + resolvers + translations)
  dishacledSchema.schema.ts  # type defs, Entitytyping and RouteNames enums
  dishacledResolver.ts       # field resolvers
  dishacledRoutes.ts         # PWA route definitions
  dishacledAppConfig.ts      # env-driven app config (port, oauth, api urls, db)
  dishacledPermissions.ts    # permission definitions
  queries/                   # client-side query documents and fragments
  sources/                   # forms, type→collection and type→pill-label mappings
  translations/
```

## Running it

The service is not run standalone — it is built and started as part of the client stack. From `clients/dishacled-wp3-prototype-elody`:

```bash
task build-client
task start-client
task generate      # regenerate ../generated-types after schema or query changes
```

Runtime is Bun (`bun src/main.ts`, `bun --watch src/main.ts` for watch mode); configuration comes from the client's `.env`.

## Adding an entity type

1. Add it to the `Entitytyping` enum and declare its type in `dishacledSchema.schema.ts`.
2. Add field resolvers in `dishacledResolver.ts`.
3. Add its query document under `src/queries/entities/`, and reference it from `src/queries/dishacled.queries.ts`.
4. Add a form in `src/sources/forms.ts` and a route in `dishacledRoutes.ts`.
5. Add `create:<type>` to `dishacledPermissions.ts`, and register the type in the collection-module (`../../client-collection-module`).
6. Add translation keys and run `task generate`.
