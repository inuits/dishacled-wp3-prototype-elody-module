// The read/render half of the connection model. The canonical model and its
// exhaustive tests live in the collection-api
// (client-collection-module/tests/test_connections.py); these tests pin the
// behaviour the two sides must agree on, plus the form the UI is built from.

import {
  connectionFormFields,
  connectionsForPipeline,
  defaultChannelName,
  inputPorts,
  nestMetadata,
  outputPorts,
  parsePortReference,
  producerOptionsFor,
  shapeMatch,
  stateLabel,
} from "./pipelineConnections";

const CM_SHAPE = "https://dishacled.github.io/demo#MeasurementsInCmShape";
const MM_SHAPE = "https://dishacled.github.io/demo#MeasurementsInMmShape";

function port(
  component: string,
  name: string,
  direction: "in" | "out",
  shapeIri: string | null,
) {
  return {
    component,
    name,
    direction,
    role: direction === "in" ? "input" : "output",
    label: name,
    shapeIri,
    shapeLabel: null,
    isRequired: true,
    reference: `${component}|${name}`,
  };
}

function component(id: string, name: string, ports: any[]) {
  return {
    _id: id,
    identifiers: [id],
    type: "githubProcessor",
    metadata: [{ key: "name", value: name }],
    data: { ports },
  };
}

const POLLER_CM = component("local--http-poller-cm", "HTTP poller (cm)", [
  port("local--http-poller-cm", "output", "out", CM_SHAPE),
]);
const POLLER_MM = component("local--http-poller-mm", "HTTP poller (mm)", [
  port("local--http-poller-mm", "output", "out", MM_SHAPE),
]);
const MONITOR_CM = component(
  "local--threshold-monitor-cm",
  "Threshold monitor (cm)",
  [
    port("local--threshold-monitor-cm", "input", "in", CM_SHAPE),
    port("local--threshold-monitor-cm", "output", "out", CM_SHAPE),
  ],
);

const COMPONENTS: Record<string, any> = {
  [POLLER_CM._id]: POLLER_CM,
  [POLLER_MM._id]: POLLER_MM,
  [MONITOR_CM._id]: MONITOR_CM,
};

function pipeline(relations: any[]) {
  return { _id: "pipeline-1", type: "pipeline", relations };
}

function processor(key: string, metadata: any[] = []) {
  return { key, type: "hasProcessor", metadata };
}

function connectedTo(source: string) {
  return processor("local--threshold-monitor-cm", [
    { key: "connections.input.from", value: source },
  ]);
}

describe("port references", () => {
  it("splits a component id from a port name", () => {
    expect(parsePortReference("local--http-poller-cm|output")).toEqual([
      "local--http-poller-cm",
      "output",
    ]);
  });

  it("rejects a value that is not a reference", () => {
    expect(parsePortReference("local--http-poller-cm")).toEqual([null, null]);
    expect(parsePortReference("")).toEqual([null, null]);
    expect(parsePortReference(undefined)).toEqual([null, null]);
  });
});

describe("nestMetadata", () => {
  it("expands dotted keys", () => {
    expect(nestMetadata([{ key: "connections.input.from", value: "a|out" }]))
      .toEqual({ connections: { input: { from: "a|out" } } });
  });

  it("skips entries without a key", () => {
    expect(nestMetadata([{ value: "x" }])).toEqual({});
  });
});

describe("shapeMatch", () => {
  it("is null when either side is untyped", () => {
    expect(shapeMatch(null, CM_SHAPE)).toBeNull();
    expect(shapeMatch(CM_SHAPE, undefined)).toBeNull();
  });

  it("compares two known shapes", () => {
    expect(shapeMatch(CM_SHAPE, CM_SHAPE)).toBe(true);
    expect(shapeMatch(MM_SHAPE, CM_SHAPE)).toBe(false);
  });
});

describe("ports", () => {
  it("splits by direction", () => {
    expect(inputPorts(MONITOR_CM).map((p) => p.name)).toEqual(["input"]);
    expect(outputPorts(MONITOR_CM).map((p) => p.name)).toEqual(["output"]);
  });

  it("yields nothing for a component without ports", () => {
    expect(inputPorts({})).toEqual([]);
  });
});

describe("connectionsForPipeline", () => {
  it("reads a directed link off the consumer's relation", () => {
    const [connection] = connectionsForPipeline(
      pipeline([
        processor("local--http-poller-cm"),
        connectedTo("local--http-poller-cm|output"),
      ]),
      COMPONENTS,
    );
    expect(connection.source).toBe("local--http-poller-cm");
    expect(connection.sourcePort).toBe("output");
    expect(connection.sourceRole).toBe("output");
    expect(connection.target).toBe("local--threshold-monitor-cm");
    expect(connection.targetPort).toBe("input");
    expect(connection.targetRole).toBe("input");
  });

  it("carries both shapes and reports a match", () => {
    const [connection] = connectionsForPipeline(
      pipeline([
        processor("local--http-poller-cm"),
        connectedTo("local--http-poller-cm|output"),
      ]),
      COMPONENTS,
    );
    expect(connection.sourceShape).toBe(CM_SHAPE);
    expect(connection.targetShape).toBe(CM_SHAPE);
    expect(connection.isShapeMatch).toBe(true);
  });

  it("models a mismatching pair rather than dropping it", () => {
    const [connection] = connectionsForPipeline(
      pipeline([
        processor("local--http-poller-mm"),
        connectedTo("local--http-poller-mm|output"),
      ]),
      COMPONENTS,
    );
    expect(connection.isShapeMatch).toBe(false);
  });

  it("defaults the state to the unvalidated placeholder", () => {
    const [connection] = connectionsForPipeline(
      pipeline([
        processor("local--http-poller-cm"),
        connectedTo("local--http-poller-cm|output"),
      ]),
      COMPONENTS,
    );
    expect(connection.state).toBe("unvalidated");
    expect(connection.stateMessage).toBe("");
  });

  it("prefers a stored state over the placeholder", () => {
    const [connection] = connectionsForPipeline(
      pipeline([
        processor("local--http-poller-mm"),
        processor("local--threshold-monitor-cm", [
          {
            key: "connections.input.from",
            value: "local--http-poller-mm|output",
          },
          { key: "connections.input.state", value: "invalid" },
          { key: "connections.input.stateMessage", value: "unit mismatch" },
        ]),
      ]),
      COMPONENTS,
    );
    expect(connection.state).toBe("invalid");
    expect(connection.stateMessage).toBe("unit mismatch");
  });

  it("derives a channel name from both endpoints", () => {
    const [connection] = connectionsForPipeline(
      pipeline([
        processor("local--http-poller-cm"),
        connectedTo("local--http-poller-cm|output"),
      ]),
      COMPONENTS,
    );
    expect(connection.channel).toBe(
      "http-poller-cm-output-to-threshold-monitor-cm-input",
    );
    expect(connection.channel).toBe(
      defaultChannelName(POLLER_CM, "output", MONITOR_CM, "input"),
    );
  });

  it("keeps an explicit channel", () => {
    const [connection] = connectionsForPipeline(
      pipeline([
        processor("local--http-poller-cm"),
        processor("local--threshold-monitor-cm", [
          {
            key: "connections.input.from",
            value: "local--http-poller-cm|output",
          },
          { key: "connections.input.channel", value: "measurements" },
        ]),
      ]),
      COMPONENTS,
    );
    expect(connection.channel).toBe("measurements");
  });

  it("ignores a producer that is not on the pipeline", () => {
    expect(
      connectionsForPipeline(
        pipeline([connectedTo("local--http-poller-cm|output")]),
        COMPONENTS,
      ),
    ).toEqual([]);
  });

  it("ignores a self-connection", () => {
    expect(
      connectionsForPipeline(
        pipeline([connectedTo("local--threshold-monitor-cm|output")]),
        COMPONENTS,
      ),
    ).toEqual([]);
  });

  it("ignores an unset input port", () => {
    expect(
      connectionsForPipeline(
        pipeline([
          processor("local--http-poller-cm"),
          processor("local--threshold-monitor-cm", [
            { key: "connections.input.from", value: "" },
          ]),
        ]),
        COMPONENTS,
      ),
    ).toEqual([]);
  });

  it("ignores non-processor relations", () => {
    expect(
      connectionsForPipeline(
        pipeline([{ key: "runner-1", type: "hasRunner", metadata: [] }]),
        COMPONENTS,
      ),
    ).toEqual([]);
  });
});

describe("producerOptionsFor", () => {
  const PIPELINE = pipeline([
    processor("local--http-poller-cm"),
    processor("local--http-poller-mm"),
    processor("local--threshold-monitor-cm"),
  ]);

  it("offers the other components' output ports", () => {
    const options = producerOptionsFor(
      PIPELINE,
      COMPONENTS,
      "local--threshold-monitor-cm",
      CM_SHAPE,
    );
    expect(options.map((o) => o.value).sort()).toEqual([
      "local--http-poller-cm|output",
      "local--http-poller-mm|output",
    ]);
  });

  it("flags the incompatible producer instead of hiding it", () => {
    const options = producerOptionsFor(
      PIPELINE,
      COMPONENTS,
      "local--threshold-monitor-cm",
      CM_SHAPE,
    );
    const byValue = Object.fromEntries(options.map((o) => [o.value, o]));
    expect(byValue["local--http-poller-cm|output"].isShapeMatch).toBe(true);
    expect(byValue["local--http-poller-mm|output"].isShapeMatch).toBe(false);
  });

  it("never offers the target itself", () => {
    const options = producerOptionsFor(
      PIPELINE,
      COMPONENTS,
      "local--threshold-monitor-cm",
      CM_SHAPE,
    );
    expect(
      options.some((o) => o.component === "local--threshold-monitor-cm"),
    ).toBe(false);
  });
});

describe("connectionFormFields", () => {
  const PIPELINE = pipeline([
    processor("local--http-poller-cm"),
    processor("local--http-poller-mm"),
    processor("local--threshold-monitor-cm"),
  ]);

  const fields = connectionFormFields(MONITOR_CM, PIPELINE, COMPONENTS, [
    "existing-channel",
  ]);

  it("emits one field set per input port, under dotted keys", () => {
    expect(Object.keys(fields).sort()).toEqual([
      "connections.input.channel",
      "connections.input.from",
      "connections.input.state",
      "connections.input.stateMessage",
    ]);
  });

  it("offers every producer plus an explicit disconnect option", () => {
    const options = fields["connections.input.from"].inputField.options;
    expect(options[0].value).toBe("");
    expect(options.map((o: any) => o.value)).toContain(
      "local--http-poller-cm|output",
    );
  });

  it("marks a mismatching producer in its label", () => {
    const options = fields["connections.input.from"].inputField.options;
    const mm = options.find(
      (o: any) => o.value === "local--http-poller-mm|output",
    );
    expect(mm.label).toContain("shape mismatch");
  });

  it("leaves the state field read-only for validation to fill", () => {
    expect(fields["connections.input.state"].inputField.disabled).toBe(true);
  });

  it("shows the reason a link was rejected, also read-only", () => {
    expect(fields["connections.input.stateMessage"].inputField.disabled).toBe(
      true,
    );
  });

  it("offers the pipeline's channels plus a derived default", () => {
    const options = fields["connections.input.channel"].inputField.options;
    expect(options[0].value).toBe("");
    expect(options.map((o: any) => o.value)).toContain("existing-channel");
  });

  it("returns nothing for a component with no input ports", () => {
    expect(connectionFormFields(POLLER_CM, PIPELINE, COMPONENTS)).toEqual({});
  });
});

describe("connection verdicts", () => {
  it("reads the state the collection-api stamped onto the relation", () => {
    const [connection] = connectionsForPipeline(
      pipeline([
        processor("local--http-poller-mm"),
        processor("local--threshold-monitor-cm", [
          {
            key: "connections.input.from",
            value: "local--http-poller-mm|output",
          },
          { key: "connections.input.state", value: "invalid" },
          {
            key: "connections.input.stateMessage",
            value: 'HTTP poller (mm) → Threshold monitor (cm): "unit" ...',
          },
        ]),
      ]),
      COMPONENTS,
    );
    expect(connection.state).toBe("invalid");
    expect(connection.stateMessage).toContain("unit");
  });

  it("condenses a verdict into a label", () => {
    expect(stateLabel("valid", "")).toBe("compatible");
    expect(stateLabel("invalid", "unit mismatch")).toBe("unit mismatch");
    expect(stateLabel("invalid", "")).toBe("incompatible");
    expect(stateLabel("unknown", "")).toBe("not verifiable");
    expect(stateLabel("unvalidated", "")).toBe("not validated yet");
  });
});
