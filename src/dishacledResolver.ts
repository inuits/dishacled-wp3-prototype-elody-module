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
      else if (type === "jvmrmlprocessor") return "JvmRmlProcessor";
      else if (type === "pylogprocessor") return "PyLogProcessor";
      else if (type === "tshttputilsprocessor") return "TsHttpUtilsProcessor";
      else if (type === "runner") return "Runner";
      else if (type === "jsrunner") return "JsRunner";
      else if (type === "jvmrunner") return "JvmRunner";
      else if (type === "pyrunner") return "PyRunner";
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
  JvmRmlProcessor: {
    ...baseSetOffResolvers,
  },
  PyLogProcessor: {
    ...baseSetOffResolvers,
  },
  TsHttpUtilsProcessor: {
    ...baseSetOffResolvers,
  },
  Runner: {
    ...baseSetOffResolvers,
  },
  JsRunner: {
    ...baseSetOffResolvers,
  },
  JvmRunner: {
    ...baseSetOffResolvers,
  },
  PyRunner: {
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
