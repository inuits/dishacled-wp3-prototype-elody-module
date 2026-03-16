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
