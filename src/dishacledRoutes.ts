import {
  Collection,
  Entitytyping,
  RouteNames,
} from "../generated-types/type-defs";

export const dishacledRoutes = [
  {
    path: "/",
    name: RouteNames.Home,
    component: "HomeWrapper",
    meta: {
      requiresAuth: true,
      type: Collection.Entities,
      entityType: Entitytyping.Pipeline,
      breadcrumbs: [
        {
          overviewPage: RouteNames.Pipelines,
        },
      ],
    },
    children: [
      {
        path: ":type/:id",
        name: RouteNames.SingleEntity,
        component: "SingleEntity",
        meta: {
          requiresAuth: true,
          entityPageConfig: {
            [Entitytyping.Alert]: {
              hasEditMetadataButton: false,
              deleteButton: false,
            },
            [Entitytyping.Pipeline]: {
              actions: [
                // Two exports, and which one you want depends on what you are
                // about to do with it. Offering only the definition sent people
                // to `npx rdfc` with the generator's input, which loads a graph
                // with no rdfc:Pipeline in it and starts nothing.
                {
                  type: "downloadZip",
                  label: "actions.labels.export-pipeline-runnable",
                  icon: "Export",
                  endpointUrl: "api/pipelines/$id/export.ttl",
                  endpointMethod: "GET",
                },
                {
                  type: "downloadZip",
                  label: "actions.labels.export-pipeline-definition",
                  icon: "Export",
                  endpointUrl: "api/pipelines/$id/definition.ttl",
                  endpointMethod: "GET",
                },
              ],
            },
          },
        },
      },
      {
        path: "alerts",
        name: RouteNames.Alerts,
        component: "Home",
        meta: {
          requiresAuth: true,
          type: Collection.Entities,
          entityType: Entitytyping.Alert,
          // Alerts are read live from the SPARQL error graph, so the overview
          // re-queries on a timer: a new threshold breach shows up without the
          // user reloading. Opt-in per route -- no other overview polls.
          pollIntervalMs: 15000,
          breadcrumbs: [
            {
              overviewPage: RouteNames.Alerts,
            },
          ],
        },
      },
      {
        path: "pipelines",
        name: RouteNames.Pipelines,
        component: "Home",
        meta: {
          requiresAuth: true,
          type: Collection.Entities,
          entityType: Entitytyping.Pipeline,
          breadcrumbs: [
            {
              overviewPage: RouteNames.Pipelines,
            },
          ],
        },
      },
      {
        path: "runners",
        name: RouteNames.Runners,
        component: "Home",
        meta: {
          queries: {
            getEntities: "GetAllRunnerEntities",
            getFilters: "GetAllRunnerFilters",
            getSortOptions: "GetAllRunnerSortOptions",
            getBulkOperations: "GetAllRunnerBulkOperations",
          },
          requiresAuth: true,
          type: Collection.Entities,
          entityType: Entitytyping.Runner,
          breadcrumbs: [
            {
              overviewPage: RouteNames.Runners,
            },
          ],
        },
      },
      {
        path: "channels",
        name: RouteNames.Channels,
        component: "Home",
        meta: {
          requiresAuth: true,
          type: Collection.Entities,
          entityType: Entitytyping.Channel,
          breadcrumbs: [
            {
              overviewPage: RouteNames.Channels,
            },
          ],
        },
      },
      {
        path: "users",
        name: RouteNames.Users,
        component: "Home",
        meta: {
          requiresAuth: true,
          type: Collection.Entities,
          entityType: Entitytyping.User,
          breadcrumbs: [
            {
              overviewPage: RouteNames.Users,
            },
          ],
        },
      },
    ],
  },
  { path: "/home", redirect: "/" },
];
