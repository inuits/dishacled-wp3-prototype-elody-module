import { resolveId, resolveRelations, simpleReturn } from "base-graphql";
import {
  BaseEntity,
  Metadata,
  Resolvers,
  WindowElement,
  RelationFieldInput,
} from "../generated-types/type-defs";

const baseSetOffResolvers = {
  id: resolveId,
  uuid: resolveId,
  intialValues: simpleReturn,
  allowedViewModes: simpleReturn,
  relationValues: resolveRelations,
  entityView: simpleReturn,
  teaserMetadata: simpleReturn,
  deleteQueryOptions: simpleReturn,
  mapElement: simpleReturn,
};

export const dishacledResolver: Resolvers = {
  Entity: {
    __resolveType(obj) {
      const type = obj.type?.toLowerCase();
      if (type === "user") return "User";
      else if (type === "tenant") return "Tenant";
      else if (type === "pipeline") return "Pipeline";
      else if (type === "processor") return "Processor";
      else if (type === "runner") return "Runner";
      else if (type === "channel") return "Channel";
      return "BaseEntity";
    },
  },
  User: {
    ...baseSetOffResolvers,
  },
  Tenant: {
    ...baseSetOffResolvers,
  },
  Pipeline: {
    ...baseSetOffResolvers,
  },
  Processor: {
    ...baseSetOffResolvers,
  },
  Runner: {
    ...baseSetOffResolvers,
  },
  Channel: {
    ...baseSetOffResolvers,
  },
  Query: {
    BulkOperationsRelationForm: async (
      _source: any,
      _args,
      { dataSources },
    ) => {
      return {} as WindowElement;
    },
  },
  Mutation: {
    CreateEntity: async (_source, { entity }, { dataSources }) => {
      const createdEntity = await dataSources.CollectionAPI.createEntity(
        entity,
        (entity.metadata as Metadata[]) || [],
        (entity.relations as RelationFieldInput[]) || [],
      );
      return createdEntity as BaseEntity;
    },
  },
};
