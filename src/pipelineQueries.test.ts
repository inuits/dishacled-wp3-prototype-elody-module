// The pipeline's own query document, on the points a pipeline depends on and
// a reader cannot check by eye.
//
// The picker greys out an entity the parent is already related to, which is
// right for most relations -- picking the same author twice is a slip -- and
// wrong for a pipeline: a step is a *use* of a component, so the same
// component can be used twice (two loggers in the tutorial pipeline, two
// dashboards on different alert graphs). The flag that says so lives in the
// bulk-operation config, and nothing else in the stack can compensate for it
// being absent: the API accepts the second step and the serializers round-trip
// it, the picker just never offers it.
//
// Read as source rather than imported: pulling in the gql document drags in
// graphql-modules, which this suite has no resolver for.

import { readFileSync } from "fs";
import { join } from "path";

const document = readFileSync(
  join(__dirname, "queries/entities/pipeline.queries.ts"),
  "utf8",
);

const addProcessorOperation = (): string => {
  const start = document.indexOf('label: "bulk-operations.add-processor"');
  expect(start).toBeGreaterThan(-1);
  const rest = document.slice(start);
  const next = rest.indexOf('label: "bulk-operations.delete-selected"');
  return next === -1 ? rest : rest.slice(0, next);
};

describe("the pipeline's add-processor operation", () => {
  it("allows a component to be used more than once", () => {
    expect(addProcessorOperation()).toContain("allowDuplicateRelations: true");
  });

  it("opens the entity picker to do it", () => {
    const operation = addProcessorOperation();
    expect(operation).toContain("typeModal: DynamicForm");
    expect(operation).toContain("GetEntityPickerForm");
  });
});

describe("the processors panel", () => {
  it("lists the pipeline's steps through the relation-scoped filter", () => {
    expect(document).toContain('relationType: label(input: "hasProcessor")');
    expect(document).toContain(
      'customQueryFilters(input: "GetRelatedProcessorFilter")',
    );
  });
});
