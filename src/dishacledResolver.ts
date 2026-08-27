import { resolveId, resolveRelations, simpleReturn } from "base-graphql";
import {
  BaseEntity,
  Metadata,
  Resolvers,
  WindowElement,
  RelationFieldInput,
} from "../generated-types/type-defs";
import { resolveAlertShapeFields } from "./alertShapeFields";
import {
  channelOptions,
  formHasChannelField,
  injectChannelOptions,
} from "./channelOptions";
import {
  connectionFormFields,
  connectionsForPipeline,
  inputPorts,
  processorRelations,
} from "./pipelineConnections";

// Words rendered in uppercase when humanizing parameter names into labels.
const ACRONYMS = new Set(["url", "iri", "id", "db", "api", "http", "mime"]);

// Turn a camelCase parameter name into a human-readable label. Labels are
// plain text (not translation keys) so every SHACL-described processor gets
// readable field labels without per-processor translation maintenance.
function humanizeLabel(name: string): string {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .split(" ");
  return words
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return word.toUpperCase();
      if (i === 0) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      return lower;
    })
    .join(" ");
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
      label: humanizeLabel(p.name),
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
        // config is edited exclusively via the Configure modal
        // (ProcessorRelationConfig); the inline list view is read-only
        isEditable: false,
        fields,
      },
    ],
  };
}

// Build the processorConfig: the existing read-only panels plus the
// modalFormFields (SHACL-1.2-UI derived) used by the dynamic config form.
function buildConfig(data: any, channelOptions: string[]): any {
  const base = buildProcessorConfig(data?.properties || [], channelOptions);
  const panels = [
    ...(base?.panels || []),
    ...buildConnectionPanels(data),
  ];
  const withPanels = panels.length > 0 ? { ...(base || {}), panels } : base;
  if (data?.formFields) {
    return {
      ...(withPanels || {}),
      formFields: injectChannelOptions(data.formFields, channelOptions),
    };
  }
  return withPanels;
}

// A read-only panel per component showing what each of its input ports is fed
// from and how validation judged that link. The values are relation metadata
// (`connections.<port>.*`), so the PWA fills them in from the pipeline's
// hasProcessor relation the same way it fills the config panel. The state
// field is empty until B3's validation writes a verdict into it.
function buildConnectionPanels(data: any): any[] {
  const inputs = (data?.ports || []).filter((p: any) => p?.direction === "in");
  if (inputs.length === 0) return [];

  const fields = inputs.flatMap((port: any) => [
    {
      key: `connections.${port.name}.from`,
      label: `${port.name} ← producer`,
      inputFieldType: "text",
      isRequired: false,
      inValues: [],
      value: "",
    },
    {
      key: `connections.${port.name}.state`,
      label: `${port.name} validation state`,
      inputFieldType: "text",
      isRequired: false,
      inValues: [],
      value: "",
    },
    // Why the link was judged the way it was. The collection-api writes both
    // keys onto the hasProcessor relation on every pipeline save, so an
    // incompatible connection states its reason right next to the producer
    // that caused it.
    {
      key: `connections.${port.name}.stateMessage`,
      label: `${port.name} validation message`,
      inputFieldType: "text",
      isRequired: false,
      inValues: [],
      value: "",
    },
  ]);

  return [
    {
      label: "panel-labels.processor-connections",
      panelType: "relationMetadata",
      // connections are drawn in the Connect modal, not edited inline
      isEditable: false,
      fields,
    },
  ];
}

function hasChannelFields(properties: any[]): boolean {
  return properties.some((p: any) => isChannelField(p));
}

// The form is the better witness: it carries the nested blocks, and a channel
// field inside one still needs the channel list. The flat property list stays
// as a fallback for a component that has properties but no derived form.
function needsChannelOptions(data: any): boolean {
  return (
    formHasChannelField(data?.formFields) ||
    hasChannelFields(data?.properties || [])
  );
}

async function resolveProcessorConfig(
  obj: any,
  _args: any,
  { dataSources }: any,
): Promise<any> {
  // 1. Use inline data.properties if present (e.g., from single entity fetch)
  if (obj?.data?.properties?.length > 0) {
    const channels = needsChannelOptions(obj.data)
      ? await channelOptions(dataSources)
      : [];
    return buildConfig(obj.data, channels);
  }

  // 2. For githubProcessor entities, fetch individually to get TTL properties.
  // obj.id covers the single-entity query path (no identifiers/_id selected).
  const entityType = obj.type || "githubProcessor";
  const entityId =
    obj.identifiers?.[0] || obj._id || obj.id?.split("/").pop() || obj.id;
  if (entityType === "githubProcessor" && entityId) {
    try {
      const fullEntity = await dataSources.CollectionAPI.GetEntity(
        "githubProcessor" as any,
        entityId,
      );
      if (fullEntity?.data?.properties?.length > 0) {
        const channels = needsChannelOptions(fullEntity.data)
          ? await channelOptions(dataSources)
          : [];
        return buildConfig(fullEntity.data, channels);
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

    const channels = hasChannelFields(definition.data.properties)
      ? await channelOptions(dataSources)
      : [];
    return buildConfig(definition.data, channels);
  } catch {
    return null;
  }
}

// The component's data contract: the shapes it consumes and produces. The
// collection-api derives these from the contract catalog and puts them on the
// entity's data; they are what lets the pipeline editor connect one
// component's output to a compatible input and validate the resulting chain.
// A dataset produces data but consumes none, so its inputShape is null.
function pickContract(data: any): any {
  if (!data?.componentIri) return null;
  return {
    componentIri: data.componentIri,
    componentKind: data.componentKind ?? null,
    configShape: data.configShape ?? null,
    inputShape: data.inputShape ?? null,
    outputShape: data.outputShape ?? null,
  };
}

async function resolveComponentContract(
  obj: any,
  _args: any,
  { dataSources }: any,
): Promise<any> {
  // inline data, e.g. from a single entity fetch
  const inline = pickContract(obj?.data);
  if (inline) return inline;

  // otherwise fetch the entity individually, the way processorConfig does:
  // list responses do not carry the TTL-derived data
  const entityId =
    obj?.identifiers?.[0] || obj?._id || obj?.id?.split("/").pop() || obj?.id;
  if (!entityId) return null;

  try {
    const fullEntity = await dataSources.CollectionAPI.GetEntity(
      "githubProcessor" as any,
      entityId,
    );
    return pickContract(fullEntity?.data);
  } catch {
    return null;
  }
}

// The wiring points a component exposes. Derived by the collection-api from
// the channel-typed config properties, typed by the component's contract.
async function resolveComponentPorts(
  obj: any,
  _args: any,
  { dataSources }: any,
): Promise<any> {
  if (Array.isArray(obj?.data?.ports)) return obj.data.ports;

  const id =
    obj?.identifiers?.[0] || obj?._id || obj?.id?.split("/").pop() || obj?.id;
  if (!id) return null;
  try {
    const fullEntity = await dataSources.CollectionAPI.GetEntity(
      "githubProcessor" as any,
      id,
    );
    return fullEntity?.data?.ports ?? null;
  } catch {
    return null;
  }
}

// Fetch every component a pipeline holds, keyed by id. Both connection
// resolvers need this: a connection's two endpoints only become typed once
// both components' ports are known.
async function fetchPipelineComponents(
  pipeline: any,
  dataSources: any,
): Promise<Record<string, any>> {
  const keys = Array.from(
    new Set(processorRelations(pipeline).map((relation: any) => relation.key)),
  );
  const components: Record<string, any> = {};
  await Promise.all(
    keys.map(async (key: any) => {
      try {
        components[key] = await dataSources.CollectionAPI.getEntity(
          key,
          "githubProcessor",
        );
      } catch {
        // a component that cannot be fetched simply contributes no ports
      }
    }),
  );
  return components;
}

// The chain-validation report for a pipeline: whether every producer's output
// shape is acceptable to the consumer it feeds, and the structured violation
// list when it is not.
//
// It is computed by the collection-api rather than here: deciding it means
// producing a sample under one SHACL shape and validating it against another,
// which needs the shape graphs and a SHACL engine. This resolver is the read
// path onto `GET /pipelines/<id>/validation`.
async function resolvePipelineValidation(
  pipelineId: string,
  dataSources: any,
): Promise<any> {
  if (!pipelineId) return null;
  try {
    // `get` is protected on RESTDataSource; going through it anyway keeps the
    // auth headers and tenant context that willSendRequest attaches, which a
    // bare fetch would not have.
    return await (dataSources.CollectionAPI as any).get(
      `pipelines/${pipelineId}/validation`,
    );
  } catch (e) {
    console.error("[resolvePipelineValidation] Failed:", e);
    return null;
  }
}

async function resolvePipelineConnections(
  pipelineId: string,
  dataSources: any,
): Promise<any> {
  try {
    const pipeline = await dataSources.CollectionAPI.getEntity(
      pipelineId,
      "pipeline",
    );
    if (!pipeline) return null;
    const components = await fetchPipelineComponents(pipeline, dataSources);
    return connectionsForPipeline(pipeline, components);
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
      else if (type === "alert") return "Alert";
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
    pipelineConnections: async (obj: any, _args: any, { dataSources }: any) => {
      const id =
        obj?.identifiers?.[0] || obj?._id || obj?.id?.split("/").pop() || obj?.id;
      return id ? await resolvePipelineConnections(id, dataSources) : null;
    },
    pipelineValidation: async (obj: any, _args: any, { dataSources }: any) => {
      const id =
        obj?.identifiers?.[0] || obj?._id || obj?.id?.split("/").pop() || obj?.id;
      return id ? await resolvePipelineValidation(id, dataSources) : null;
    },
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
    componentContract: resolveComponentContract,
    componentPorts: resolveComponentPorts,
  },
  Channel: {
    ...baseSetOffResolvers,
  },
  Alert: {
    ...baseSetOffResolvers,
    shapeFields: async (parent: any, _args: any, { dataSources }: any) =>
      await resolveAlertShapeFields(parent, dataSources),
  },
  Query: {
    // Direct fetch of a github processor's SHACL-derived config form
    // (modalFormFields), with live channel options. Used by the processor
    // config modal; bypasses the entity-union resolution which does not
    // work for http-stored github processors.
    ProcessorConfigForm: async (_source: any, { id }: any, { dataSources }) => {
      try {
        const entity = await dataSources.CollectionAPI.getEntity(
          id,
          "githubProcessor",
        );
        const formFields = entity?.data?.formFields;
        if (!formFields) return null;
        // asked of the form, so a processor whose only channel fields are
        // nested (RmlMapper's rdfc:source / rdfc:defaultTarget) still gets them
        const channels = needsChannelOptions(entity?.data)
          ? await channelOptions(dataSources)
          : [];
        return injectChannelOptions(formFields, channels);
      } catch {
        return null;
      }
    },
    // Direct fetch of a component's input/output shapes. Mirrors
    // ProcessorConfigForm above and exists for the same reason: entity-union
    // resolution does not work for http-stored github processors.
    ComponentContract: async (_source: any, { id }: any, { dataSources }) => {
      try {
        const entity = await dataSources.CollectionAPI.getEntity(
          id,
          "githubProcessor",
        );
        return pickContract(entity?.data);
      } catch {
        return null;
      }
    },
    // Field-source query for the connect modal. Mirrors ProcessorConfigForm,
    // but needs the pipeline as well as the component: a producer→consumer
    // link only means something inside a pipeline, and the options offered are
    // the output ports of that pipeline's other components.
    ProcessorConnectionForm: async (
      _source: any,
      { id, parentEntityId }: any,
      { dataSources }: any,
    ) => {
      if (!parentEntityId) return null;
      try {
        const [target, pipeline] = await Promise.all([
          dataSources.CollectionAPI.getEntity(id, "githubProcessor"),
          dataSources.CollectionAPI.getEntity(parentEntityId, "pipeline"),
        ]);
        if (!target || !pipeline) return null;
        if (inputPorts(target).length === 0) return {};

        const components = await fetchPipelineComponents(pipeline, dataSources);
        const channels = await channelOptions(dataSources);
        return connectionFormFields(target, pipeline, components, channels);
      } catch {
        return null;
      }
    },
    // The pipeline's links as directed, typed edges, each carrying the state
    // placeholder that B3's validation replaces.
    PipelineConnections: async (
      _source: any,
      { id }: any,
      { dataSources }: any,
    ) => {
      return await resolvePipelineConnections(id, dataSources);
    },
    // The chain-validation report: per-connection verdicts plus the structured
    // violation list ({from, to, constraint, expected, actual, message}).
    PipelineValidation: async (
      _source: any,
      { id }: any,
      { dataSources }: any,
    ) => {
      return await resolvePipelineValidation(id, dataSources);
    },
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
