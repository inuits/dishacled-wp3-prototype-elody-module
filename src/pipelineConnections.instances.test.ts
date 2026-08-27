// A pipeline is instances of components, not components.
//
// The tutorial's pipeline runs two `rdfc:LogProcessorJs` with different
// configurations. Keying by the component's document id collapsed them into
// one, both in the exported RDF (where it violated the processor's own
// `sh:maxCount 1`) and here, where the producer list deduplicated by
// `relation.key` so only one of the two could ever be picked.
//
// The canonical model and its tests are in the collection-api
// (client-collection-module/tests/test_step_instances.py); these pin the half
// the UI is built from.

import {
  connectionsForPipeline,
  instancesOf,
  producerOptionsFor,
} from "./pipelineConnections";

const LOGGER = "acme--log--LogProcessorJs";
const TICKER = "acme--tick--Ticker";

// the shape CollectionAPI serves: metadata as key/value pairs, which is what
// `entityName` reads a step's display name from
const component = (id: string, name: string, ports: any[]) => ({
  id,
  identifiers: [id],
  metadata: [{ key: "name", value: name }],
  data: { ports },
});

const port = (name: string, direction: "in" | "out", component: string) => ({
  name,
  direction,
  role: direction === "in" ? "input" : "output",
  label: name,
  component,
  reference: `${component}|${name}`,
  shapeIri: null,
  shapeLabel: null,
  isRequired: false,
});

const COMPONENTS: Record<string, any> = {
  [LOGGER]: component(LOGGER, "LogProcessorJs", [
    port("reader", "in", LOGGER),
    port("writer", "out", LOGGER),
  ]),
  [TICKER]: component(TICKER, "Ticker", [port("writer", "out", TICKER)]),
};

const relation = (key: string, metadata: any[] = []) => ({
  key,
  type: "hasProcessor",
  metadata,
});

const meta = (key: string, value: string) => ({ key, value });

const twoLoggers = (sourceReference = `${TICKER}|writer`) => ({
  relations: [
    relation(TICKER),
    relation(LOGGER, [
      meta("label", "report"),
      meta("connections.reader.from", sourceReference),
    ]),
    relation(LOGGER, [
      meta("label", "output"),
      meta("connections.reader.from", sourceReference),
    ]),
  ],
});

describe("instancesOf", () => {
  it("gives each relation its own id", () => {
    expect(instancesOf(twoLoggers(), COMPONENTS).map((i: any) => i.id)).toEqual([
      "ticker",
      "logprocessorjs",
      "logprocessorjs-2",
    ]);
  });

  it("keeps an id the pipeline already carries", () => {
    const pipeline = twoLoggers();
    pipeline.relations[1].metadata.push(meta("instance", "reporter"));
    expect(instancesOf(pipeline, COMPONENTS).map((i: any) => i.id)).toContain(
      "reporter",
    );
  });

  it("leaves a single instance with the plain name", () => {
    expect(
      instancesOf({ relations: [relation(TICKER)] }, COMPONENTS).map(
        (i: any) => i.id,
      ),
    ).toEqual(["ticker"]);
  });

  it("remembers which component each step is", () => {
    expect(instancesOf(twoLoggers(), COMPONENTS).map((i: any) => i.key)).toEqual([
      TICKER,
      LOGGER,
      LOGGER,
    ]);
  });
});

describe("connectionsForPipeline with two steps of one component", () => {
  it("returns one connection per step", () => {
    const connections = connectionsForPipeline(twoLoggers(), COMPONENTS);
    expect(connections).toHaveLength(2);
    expect(connections.map((c: any) => c.target).sort()).toEqual([
      "logprocessorjs",
      "logprocessorjs-2",
    ]);
  });

  it("addresses a producer by step id", () => {
    const connections = connectionsForPipeline(
      twoLoggers("ticker|writer"),
      COMPONENTS,
    );
    expect(connections).toHaveLength(2);
    expect(connections.every((c: any) => c.source === "ticker")).toBe(true);
  });

  it("gives the two connections different ids", () => {
    const ids = connectionsForPipeline(twoLoggers(), COMPONENTS).map(
      (c: any) => c.id,
    );
    expect(new Set(ids).size).toBe(2);
  });

  it("carries the component behind each end", () => {
    const [connection] = connectionsForPipeline(twoLoggers(), COMPONENTS);
    expect(connection.sourceKey).toBe(TICKER);
    expect(connection.targetKey).toBe(LOGGER);
  });
});

describe("producerOptionsFor", () => {
  it("offers each step, not each component", () => {
    // the bug: `seen.has(relation.key)` hid the second logger, so its writer
    // could never be picked as a producer
    const options = producerOptionsFor(
      twoLoggers(),
      COMPONENTS,
      "ticker",
      null,
    );
    expect(options.map((o: any) => o.value).sort()).toEqual([
      "logprocessorjs-2|writer",
      "logprocessorjs|writer",
    ]);
  });

  it("does not offer the step being configured", () => {
    const options = producerOptionsFor(
      twoLoggers(),
      COMPONENTS,
      "logprocessorjs",
      null,
    );
    expect(options.some((o: any) => o.value.startsWith("logprocessorjs|"))).toBe(
      false,
    );
    expect(
      options.some((o: any) => o.value.startsWith("logprocessorjs-2|")),
    ).toBe(true);
  });

  it("tells two steps of one component apart in the label", () => {
    const labels = producerOptionsFor(
      twoLoggers(),
      COMPONENTS,
      "ticker",
      null,
    ).map((o: any) => o.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});


// After a pipeline has been through the store, its relations name steps:
// `component~step`. That is what the framework addresses a row and its config
// form by, so the UI has to read the step out of the key.
describe("step keys", () => {
  const K1 = `${LOGGER}~logprocessorjs`;
  const K2 = `${LOGGER}~logprocessorjs-2`;

  const stored = {
    relations: [
      relation(TICKER),
      relation(K1, [meta("label", "report")]),
      relation(K2, [
        meta("label", "output"),
        meta("connections.reader.from", "ticker|writer"),
      ]),
    ],
  };

  // what the store serves for a step key: the component, addressed as the step
  const COMPONENTS_BY_KEY: Record<string, any> = {
    [K1]: component(K1, "LogProcessorJs (logprocessorjs)", [
      port("reader", "in", K1),
      port("writer", "out", K1),
    ]),
    [K2]: component(K2, "LogProcessorJs (logprocessorjs-2)", [
      port("reader", "in", K2),
      port("writer", "out", K2),
    ]),
    [TICKER]: component(TICKER, "Ticker", [port("writer", "out", TICKER)]),
  };

  it("reads the step out of the key", () => {
    expect(
      instancesOf(stored, COMPONENTS_BY_KEY).map((i: any) => i.id),
    ).toEqual(["ticker", "logprocessorjs", "logprocessorjs-2"]);
  });

  it("still knows which component each step is", () => {
    expect(
      instancesOf(stored, COMPONENTS_BY_KEY)
        .slice(1)
        .map((i: any) => i.componentId),
    ).toEqual([LOGGER, LOGGER]);
  });

  it("resolves a connection saved before the keys were qualified", () => {
    // the reference is the step id, which is the same either side of the
    // change -- it is the suffix the qualified key ends in
    const connections = connectionsForPipeline(stored, COMPONENTS_BY_KEY);
    expect(connections).toHaveLength(1);
    expect(connections[0].source).toBe("ticker");
    expect(connections[0].target).toBe("logprocessorjs-2");
  });

  it("offers each step under its own reference", () => {
    expect(
      producerOptionsFor(stored, COMPONENTS_BY_KEY, "ticker", null)
        .map((o: any) => o.value)
        .sort(),
    ).toEqual(["logprocessorjs-2|writer", "logprocessorjs|writer"]);
  });

  it("does not offer the step the modal was opened on", () => {
    // the modal passes the row's entity id, which is the relation key
    const options = producerOptionsFor(stored, COMPONENTS_BY_KEY, K1, null);
    expect(options.some((o: any) => o.value.startsWith("logprocessorjs|"))).toBe(
      false,
    );
  });
});
