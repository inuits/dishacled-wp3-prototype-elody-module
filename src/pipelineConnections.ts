// Directed, typed producer->consumer links between pipeline components.
//
// The model lives in the collection-api (apps/dishacled/pipeline/connections.py);
// this is the read/render half of it. Ports are not re-derived here: the
// collection-api puts them on each component's `data.ports`, so the two sides
// cannot disagree about what a component's wiring points are.
//
// A connection is stored as metadata on the pipeline's hasProcessor relation
// for the *consumer*, one entry per input port:
//
//     connections.<inputPort>.from     -> "<componentId>|<outputPort>"
//     connections.<inputPort>.channel  -> optional channel name
//     connections.<inputPort>.state    -> filled in by validation (B3)
//
// which is exactly the dotted-key convention the SHACL config fields already
// use, so the existing relation-config save path persists it unchanged.

export const PORT_SEPARATOR = "|";
export const CONNECTIONS_KEY = "connections";
export const SOURCE_FIELD = "from";
export const CHANNEL_FIELD = "channel";
export const STATE_FIELD = "state";
export const STATE_MESSAGE_FIELD = "stateMessage";
export const STATE_UNVALIDATED = "unvalidated";
export const PROCESSOR_RELATION = "hasProcessor";

export type Port = {
  component: string;
  name: string;
  direction: "in" | "out";
  role: string;
  label: string;
  shapeIri: string | null;
  shapeLabel: string | null;
  isRequired: boolean;
  reference: string;
};

export function slugify(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function entityName(entity: any): string {
  const metadata = entity?.metadata;
  if (Array.isArray(metadata)) {
    const named = metadata.find((m: any) => m?.key === "name" && m?.value);
    if (named) return String(named.value);
  } else if (metadata?.name?.value) {
    return String(metadata.name.value);
  }
  return String(entity?._id || entity?.id || "");
}

export function entityId(entity: any): string {
  return String(entity?._id || entity?.identifiers?.[0] || entity?.id || "");
}

export function portsOf(entity: any): Port[] {
  const ports = entity?.data?.ports;
  return Array.isArray(ports) ? (ports as Port[]) : [];
}

export function inputPorts(entity: any): Port[] {
  return portsOf(entity).filter((p) => p.direction === "in");
}

export function outputPorts(entity: any): Port[] {
  return portsOf(entity).filter((p) => p.direction === "out");
}

export function parsePortReference(
  value: any,
): [string | null, string | null] {
  const raw = typeof value === "string" ? value : "";
  const index = raw.indexOf(PORT_SEPARATOR);
  if (index <= 0 || index === raw.length - 1) return [null, null];
  return [raw.slice(0, index), raw.slice(index + 1)];
}

// Flat dotted-key metadata -> nested object, mirroring nest_metadata() on the
// collection-api side.
export function nestMetadata(metadata: any[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const item of metadata ?? []) {
    const key = item?.key;
    if (!key) continue;
    const parts = String(key).split(".");
    let cursor = result;
    parts.slice(0, -1).forEach((part) => {
      if (typeof cursor[part] !== "object" || cursor[part] === null) {
        cursor[part] = {};
      }
      cursor = cursor[part];
    });
    cursor[parts[parts.length - 1]] = item?.value;
  }
  return result;
}

export function processorRelations(pipeline: any): any[] {
  return (pipeline?.relations ?? []).filter(
    (relation: any) => relation?.type === PROCESSOR_RELATION && relation?.key,
  );
}

export function connectionSettings(relation: any): Record<string, any> {
  const settings = nestMetadata(relation?.metadata ?? [])[CONNECTIONS_KEY];
  if (!settings || typeof settings !== "object") return {};
  const normalised: Record<string, any> = {};
  for (const [port, value] of Object.entries<any>(settings)) {
    normalised[port] =
      value && typeof value === "object" ? value : { [SOURCE_FIELD]: value };
  }
  return normalised;
}

export function defaultChannelName(
  sourceEntity: any,
  sourcePort: string,
  targetEntity: any,
  targetPort: string,
): string {
  return [
    slugify(entityName(sourceEntity)),
    slugify(sourcePort),
    "to",
    slugify(entityName(targetEntity)),
    slugify(targetPort),
  ].join("-");
}

// True/false only when both shapes are known. An untyped processor must not be
// reported as incompatible — nothing is known about it either way.
export function shapeMatch(
  sourceShape: string | null | undefined,
  targetShape: string | null | undefined,
): boolean | null {
  if (!sourceShape || !targetShape) return null;
  return sourceShape === targetShape;
}

export type Connection = {
  id: string;
  source: string;
  sourcePort: string;
  sourceRole: string;
  sourceShape: string | null;
  sourceLabel: string;
  target: string;
  targetPort: string;
  targetRole: string;
  targetShape: string | null;
  targetLabel: string;
  channel: string;
  isShapeMatch: boolean | null;
  state: string;
  stateMessage: string;
};

export function connectionsForPipeline(
  pipeline: any,
  components: Record<string, any>,
): Connection[] {
  const relations = processorRelations(pipeline);
  const available = new Set(relations.map((r: any) => r.key));
  const connections: Connection[] = [];

  for (const relation of relations) {
    const target = relation.key;
    const targetEntity = components[target] ?? {};
    const targetPortsByName = new Map(
      inputPorts(targetEntity).map((p) => [p.name, p]),
    );

    const allSettings = connectionSettings(relation);
    for (const portName of Object.keys(allSettings).sort()) {
      const settings = allSettings[portName];
      const [source, sourcePortName] = parsePortReference(
        settings?.[SOURCE_FIELD],
      );
      if (!source || source === target || !available.has(source)) continue;

      const sourceEntity = components[source] ?? {};
      const sourcePort = outputPorts(sourceEntity).find(
        (p) => p.name === sourcePortName,
      );
      if (!sourcePort) continue;

      const targetPort = targetPortsByName.get(portName);
      if (!targetPort && targetPortsByName.size > 0) continue;

      connections.push({
        id: `${source}${PORT_SEPARATOR}${sourcePort.name}->${target}${PORT_SEPARATOR}${portName}`,
        source,
        sourcePort: sourcePort.name,
        sourceRole: "output",
        sourceShape: sourcePort.shapeIri ?? null,
        sourceLabel: entityName(sourceEntity),
        target,
        targetPort: portName,
        targetRole: "input",
        targetShape: targetPort?.shapeIri ?? null,
        targetLabel: entityName(targetEntity),
        channel:
          settings?.[CHANNEL_FIELD] ||
          defaultChannelName(
            sourceEntity,
            sourcePort.name,
            targetEntity,
            portName,
          ),
        isShapeMatch: shapeMatch(sourcePort.shapeIri, targetPort?.shapeIri),
        state: settings?.[STATE_FIELD] || STATE_UNVALIDATED,
        stateMessage: settings?.[STATE_MESSAGE_FIELD] || "",
      });
    }
  }
  return connections;
}

// Producer ports a given component in a given pipeline could be fed from.
// Incompatible producers are listed and flagged, never hidden: the user has to
// be able to compose the mismatching chain that validation then reports on.
export function producerOptionsFor(
  pipeline: any,
  components: Record<string, any>,
  targetId: string,
  targetShape: string | null,
): any[] {
  const options: any[] = [];
  const seen = new Set<string>();
  for (const relation of processorRelations(pipeline)) {
    if (relation.key === targetId || seen.has(relation.key)) continue;
    seen.add(relation.key);
    const entity = components[relation.key] ?? {};
    for (const port of outputPorts(entity)) {
      options.push({
        value: port.reference,
        label: `${entityName(entity)} → ${port.name}`,
        component: relation.key,
        componentLabel: entityName(entity),
        port: port.name,
        shapeIri: port.shapeIri ?? null,
        shapeLabel: port.shapeLabel ?? null,
        isShapeMatch: shapeMatch(port.shapeIri, targetShape),
      });
    }
  }
  return options;
}

const NOT_CONNECTED = "— not connected —";
const AUTO_CHANNEL = "— derived from the connection —";

function dropdownOption(label: string, value: string) {
  return {
    icon: "NoIcon",
    label,
    value,
    __typename: "DropdownOption",
  };
}

// The dynamic-form field set for connecting one component's inputs. One
// dropdown per input port (its producer), one optional channel field, and a
// read-only state field that validation fills in later.
export function connectionFormFields(
  target: any,
  pipeline: any,
  components: Record<string, any>,
  channelOptions: string[] = [],
): Record<string, any> {
  const fields: Record<string, any> = {};
  const targetId = entityId(target);

  for (const port of inputPorts(target)) {
    const options = producerOptionsFor(
      pipeline,
      components,
      targetId,
      port.shapeIri ?? null,
    );

    fields[`${CONNECTIONS_KEY}.${port.name}.${SOURCE_FIELD}`] = {
      key: `${CONNECTIONS_KEY}.${port.name}.${SOURCE_FIELD}`,
      label: `${port.name} ← producer`,
      __typename: "PanelMetaData",
      inputField: {
        type: "dropdown",
        __typename: "InputField",
        validation: null,
        options: [
          dropdownOption(NOT_CONNECTED, ""),
          ...options.map((option) =>
            dropdownOption(
              // an incompatible producer stays selectable; the label says so
              option.isShapeMatch === false
                ? `${option.label}  (shape mismatch)`
                : option.label,
              option.value,
            ),
          ),
        ],
      },
    };

    fields[`${CONNECTIONS_KEY}.${port.name}.${CHANNEL_FIELD}`] = {
      key: `${CONNECTIONS_KEY}.${port.name}.${CHANNEL_FIELD}`,
      label: `${port.name} channel (optional)`,
      __typename: "PanelMetaData",
      inputField: {
        type: "dropdown",
        __typename: "InputField",
        validation: null,
        channelField: true,
        options: [
          // left empty, the channel name is derived from the two endpoints
          dropdownOption(AUTO_CHANNEL, ""),
          ...channelOptions.map((channel) => dropdownOption(channel, channel)),
        ],
      },
    };

    fields[`${CONNECTIONS_KEY}.${port.name}.${STATE_FIELD}`] = {
      key: `${CONNECTIONS_KEY}.${port.name}.${STATE_FIELD}`,
      label: `${port.name} validation state`,
      __typename: "PanelMetaData",
      // placeholder until B3 writes a real verdict here
      inputField: {
        type: "text",
        __typename: "InputField",
        validation: null,
        disabled: true,
      },
    };
  }

  return fields;
}
