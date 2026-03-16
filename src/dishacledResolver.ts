import { resolveId, resolveRelations, simpleReturn } from "base-graphql";
import {
  BaseEntity,
  Metadata,
  Resolvers,
  WindowElement,
  RelationFieldInput,
} from "../generated-types/type-defs";

function camelToKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function isChannelField(p: any): boolean {
  if (p.inputFieldType === "channelRelationField") return true;
  const ref = p.classRef || "";
  if (ref.includes("Channel") || ref.includes("Writer") || ref.includes("Reader")) return true;
  if (p.inputFieldType === "hasWriterField") return true;
  return false;
}

function buildProcessorConfig(
  properties: any[],
  channelOptions: string[] = [],
): any {
  const fields = properties.map((p: any) => {
    const isChannel = isChannelField(p);
    return {
      key: p.name,
      label: `metadata.labels.${camelToKebab(p.name)}`,
      inputFieldType: isChannel ? "baseSelectField" : p.inputFieldType,
      isRequired: p.isRequired || false,
      inValues: isChannel ? channelOptions : p.inValues || [],
      value: "",
    };
  });

  if (fields.length === 0) return null;

  return {
    panels: [
      {
        label: "panel-labels.processor-properties",
        panelType: "relationMetadata",
        isEditable: true,
        fields,
      },
    ],
  };
}

async function fetchChannelOptions(dataSources: any): Promise<string[]> {
  try {
    const result = await dataSources.CollectionAPI.GetAdvancedEntities(
      "channel" as any,
      100,
      0,
      [
        {
          type: "selection",
          key: "type",
          value: ["channel"],
          match_exact: true,
        },
      ],
      { value: "", isAsc: undefined, key: "", order_by: "" },
    );
    return (
      result?.results?.map((c: any) => {
        const meta = c.metadata || c.data?.metadata;
        if (Array.isArray(meta)) {
          return (
            meta.find((m: any) => m.key === "name")?.value ||
            c.identifiers?.[0] ||
            ""
          );
        }
        return meta?.name?.value || c.identifiers?.[0] || "";
      }) ?? []
    );
  } catch (e) {
    console.error("[fetchChannelOptions] Failed:", e);
    return [];
  }
}

function hasChannelFields(properties: any[]): boolean {
  return properties.some((p: any) => isChannelField(p));
}

async function resolveProcessorConfig(
  obj: any,
  _args: any,
  { dataSources }: any,
): Promise<any> {
  // 1. Use inline data.properties if present (e.g., from single entity fetch)
  if (obj?.data?.properties?.length > 0) {
    const channelOptions = hasChannelFields(obj.data.properties)
      ? await fetchChannelOptions(dataSources)
      : [];
    return buildProcessorConfig(obj.data.properties, channelOptions);
  }

  // 2. For githubProcessor entities in list view, fetch individually to get TTL properties
  const entityType = obj.type;
  const entityId = obj.identifiers?.[0] || obj._id;
  if (entityType === "githubProcessor" && entityId) {
    try {
      const fullEntity = await dataSources.CollectionAPI.GetEntity(
        "githubProcessor" as any,
        entityId,
      );
      if (fullEntity?.data?.properties?.length > 0) {
        const channelOptions = hasChannelFields(fullEntity.data.properties)
          ? await fetchChannelOptions(dataSources)
          : [];
        return buildProcessorConfig(fullEntity.data.properties, channelOptions);
      }
    } catch {
      // fall through to processorDefinition lookup
    }
  }

  // 3. Look up processorDefinition by entity type
  if (!entityType) return null;

  try {
    const result = await dataSources.CollectionAPI.GetAdvancedEntities(
      "processorDefinition" as any,
      1,
      0,
      [
        {
          type: "selection",
          key: "type",
          value: ["processorDefinition"],
          match_exact: true,
        },
        {
          type: "text",
          key: "elody:1|metadata.processorType.value",
          value: [entityType],
          match_exact: true,
        },
      ],
      { value: "", isAsc: undefined, key: "", order_by: "" },
    );

    const definition = result?.results?.[0];
    if (!definition?.data?.properties?.length) return null;

    const channelOptions = hasChannelFields(definition.data.properties)
      ? await fetchChannelOptions(dataSources)
      : [];
    return buildProcessorConfig(definition.data.properties, channelOptions);
  } catch {
    return null;
  }
}

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
      else if (type === "runner") return "Runner";
      else if (type === "jsrunner") return "JsRunner";
      else if (type === "jvmrunner") return "JvmRunner";
      else if (type === "pyrunner") return "PyRunner";
      else if (type === "githubprocessor") return "GithubProcessor";
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
  GithubProcessor: {
    ...baseSetOffResolvers,
    processorConfig: resolveProcessorConfig,
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
