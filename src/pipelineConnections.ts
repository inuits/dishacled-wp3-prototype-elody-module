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
export const STATE_VALID = "valid";
export const STATE_INVALID = "invalid";
export const STATE_UNKNOWN = "unknown";
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

// A step's own identity within its pipeline, stored on the relation. It is the
// slug the step's IRI ends in, so a pipeline read back out of the store carries
// it already. Mirrors INSTANCE_FIELD in pipeline/connections.py.
export const INSTANCE_FIELD = "instance";

// A step's identity lives in the relation key -- `component~step` -- because
// that is what the framework addresses a related entity by: one row per key,
// and a config form writes back to the relation whose key it was opened on.
// Mirrors INSTANCE_SEPARATOR in pipeline/connections.py.
export const INSTANCE_SEPARATOR = "~";

export function splitComponentKey(key: string): [string, string | null] {
  const text = String(key ?? "");
  const at = text.indexOf(INSTANCE_SEPARATOR);
  if (at < 0 || at === text.length - 1) return [text, null];
  return [text.slice(0, at), text.slice(at + 1)];
}

export type Instance = {
  id: string;
  key: string; // the relation key: the component, or `component~step`
  componentId: string;
  label: string;
  relation: any;
};

function storedInstanceId(relation: any): string | null {
  for (const item of relation?.metadata ?? []) {
    if (item?.key === INSTANCE_FIELD && item?.value) return String(item.value);
  }
  return null;
}

function uniqueId(candidate: string, taken: Set<string>): string {
  if (!taken.has(candidate)) {
    taken.add(candidate);
    return candidate;
  }
  let index = 2;
  while (taken.has(`${candidate}-${index}`)) index += 1;
  const unique = `${candidate}-${index}`;
  taken.add(unique);
  return unique;
}

// Every step of a pipeline, in relation order, each with an id of its own. A
// component used twice is two steps -- which is what the tutorial's two
// loggers are, and what the toolchain's own reference definition contains.
export function instancesOf(
  pipeline: any,
  components: Record<string, any>,
): Instance[] {
  const taken = new Set<string>();
  return processorRelations(pipeline).map((relation: any) => {
    const entity = components[relation.key] ?? {};
    const [componentId, fromKey] = splitComponentKey(relation.key);
    const label = entityName(entity) || componentId;
    // the key is the authority: it is what the UI addressed this step by
    const stored = fromKey ?? storedInstanceId(relation);
    const id = stored ?? uniqueId(slugify(label) || slugify(componentId), taken);
    if (stored) taken.add(stored);
    return { id, key: relation.key, componentId, label, relation };
  });
}

// The step a stored producer reference names: by step id, or -- for pipelines
// saved before steps had identity -- by component, which then means its first
// step (the only one that could have been saved back then).
export function resolveInstance(
  reference: string | null,
  instances: Instance[],
): Instance | undefined {
  if (!reference) return undefined;
  return (
    instances.find((instance) => instance.id === reference) ??
    instances.find((instance) => instance.key === reference)
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

// One channel per producer port (mirrors channel_name_between on the
// collection side): every consumer of a port reads the same channel, which is
// what lets one output fan out to several components. Consumer arguments stay
// for signature compatibility and are deliberately not part of the name.
export function channelNameBetween(
  source: string,
  sourcePort: string,
  _target: string,
  _targetPort: string,
): string {
  return [slugify(source), slugify(sourcePort), "channel"].join("-");
}

export function defaultChannelName(
  sourceEntity: any,
  sourcePort: string,
  _targetEntity: any,
  _targetPort: string,
): string {
  return [slugify(entityName(sourceEntity)), slugify(sourcePort), "channel"].join("-");
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
  // the two ends are step ids; the component behind each travels alongside,
  // because shapes are a property of the component, not of the step
  source: string;
  sourceKey: string;
  targetKey: string;
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
  const instances = instancesOf(pipeline, components);
  const connections: Connection[] = [];

  for (const instance of instances) {
    const target = instance.id;
    const targetEntity = components[instance.key] ?? {};
    const targetPortsByName = new Map(
      inputPorts(targetEntity).map((p) => [p.name, p]),
    );

    const allSettings = connectionSettings(instance.relation);
    for (const portName of Object.keys(allSettings).sort()) {
      const settings = allSettings[portName];
      const [reference, sourcePortName] = parsePortReference(
        settings?.[SOURCE_FIELD],
      );
      const sourceInstance = resolveInstance(reference, instances);
      if (!sourceInstance || sourceInstance.id === target) continue;
      const source = sourceInstance.id;

      const sourceEntity = components[sourceInstance.key] ?? {};
      const sourcePort = outputPorts(sourceEntity).find(
        (p) => p.name === sourcePortName,
      );
      if (!sourcePort) continue;

      const targetPort = targetPortsByName.get(portName);
      if (!targetPort && targetPortsByName.size > 0) continue;

      connections.push({
        id: `${source}${PORT_SEPARATOR}${sourcePort.name}->${target}${PORT_SEPARATOR}${portName}`,
        source,
        sourceKey: sourceInstance.key,
        sourcePort: sourcePort.name,
        sourceRole: "output",
        sourceShape: sourcePort.shapeIri ?? null,
        sourceLabel: entityName(sourceEntity),
        target,
        targetKey: instance.key,
        targetPort: portName,
        targetRole: "input",
        targetShape: targetPort?.shapeIri ?? null,
        targetLabel: entityName(targetEntity),
        channel:
          settings?.[CHANNEL_FIELD] ||
          // named for the two steps: a component used twice feeds two
          // different channels, not the same one twice
          channelNameBetween(source, sourcePort.name, target, portName),
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
  const instances = instancesOf(pipeline, components);
  // a component may appear more than once; say which one when it does
  const repeated = new Set(
    instances
      .filter(
        (instance, _index, all) =>
          all.filter((other) => other.key === instance.key).length > 1,
      )
      .map((instance) => instance.key),
  );

  for (const instance of instances) {
    if (instance.id === targetId || instance.key === targetId) continue;
    const entity = components[instance.key] ?? {};
    const name = repeated.has(instance.key)
      ? `${instance.label} (${instance.id})`
      : instance.label;
    for (const port of outputPorts(entity)) {
      options.push({
        // the step id, not the relation key: it is the same before and after
        // a pipeline's keys are qualified, so a saved connection keeps
        // pointing at the same step either way
        value: `${instance.id}${PORT_SEPARATOR}${port.name}`,
        label: `${name} → ${port.name}`,
        instance: instance.id,
        component: instance.key,
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

// match(0) → unannotated(1) → mismatch(2); keeps guidance visible without
// hiding anything — an incompatible producer is still selectable.
function shapeMatchRank(isShapeMatch: boolean | null): number {
  if (isShapeMatch === true) return 0;
  if (isShapeMatch === null) return 1;
  return 2;
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
          // Guided ordering: producers whose output shape matches this input
          // come first, unannotated shapes in the middle, mismatches last.
          ...options
            .slice()
            .sort(
              (a, b) => shapeMatchRank(a.isShapeMatch) - shapeMatchRank(b.isShapeMatch),
            )
            .map((option) =>
              dropdownOption(
                option.isShapeMatch === true
                  ? `✓ ${option.label}`
                  : // an incompatible producer stays selectable; the label says so
                    option.isShapeMatch === false
                    ? `${option.label}  (shape mismatch)`
                    : option.label,
                option.value,
              ),
            ),
        ],
      },
    };

    // No channel field: a channel is an RDF-Connect build detail. Left
    // unset it is derived from the two endpoints (`channelNameBetween`),
    // which is what happened for every connection anyway — the dropdown
    // only added rdf-connect noise to the logical connect step.

    // The verdict of the last chain validation. Read-only: it is written by
    // the collection-api whenever the pipeline is saved, so editing it here
    // would only produce a value the next save overwrites.
    fields[`${CONNECTIONS_KEY}.${port.name}.${STATE_FIELD}`] = {
      key: `${CONNECTIONS_KEY}.${port.name}.${STATE_FIELD}`,
      label: `${port.name} validation state`,
      __typename: "PanelMetaData",
      inputField: {
        type: "text",
        __typename: "InputField",
        validation: null,
        disabled: true,
      },
    };

    fields[`${CONNECTIONS_KEY}.${port.name}.${STATE_MESSAGE_FIELD}`] = {
      key: `${CONNECTIONS_KEY}.${port.name}.${STATE_MESSAGE_FIELD}`,
      label: `${port.name} validation message`,
      __typename: "PanelMetaData",
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

// A connection's verdict, condensed for display next to the link itself.
export function stateLabel(state: string, message: string): string {
  if (state === STATE_VALID) return "compatible";
  if (state === STATE_INVALID) return message || "incompatible";
  if (state === STATE_UNKNOWN) return message || "not verifiable";
  return "not validated yet";
}
