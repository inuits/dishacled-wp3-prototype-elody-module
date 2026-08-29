/**
 * The RDF-declared UI: dishacled.ui.ttl is the source, the declarative
 * sections of the *.queries.ts documents are its render. These tests pin the
 * whole chain — parsing the triples into the UI model, rendering each
 * generated region, and splicing a region into a query file.
 */
import { readFileSync } from "fs";
import { join } from "path";

import {
  parseUiDeclaration,
  renderContextMenu,
  renderDetailView,
  renderEntityFile,
  renderFilters,
  renderInitialValues,
  renderSortOptions,
  renderTeaserFields,
  renderViewModes,
  replaceRegion,
  type UiEntity,
} from "./generateUiQueries";

const declaration = readFileSync(
  join(__dirname, "dishacled.ui.ttl"),
  "utf-8",
);

const entity = (graphqlType: string): UiEntity => {
  const parsed = parseUiDeclaration(declaration);
  const found = parsed.find((candidate) => candidate.graphqlType === graphqlType);
  if (!found) throw new Error(`no declaration for ${graphqlType}`);
  return found;
};

describe("parseUiDeclaration", () => {
  it("finds every declared entity type", () => {
    const types = parseUiDeclaration(declaration)
      .map((declared) => declared.graphqlType)
      .sort();
    expect(types).toEqual(["Alert", "GithubProcessor", "Pipeline"]);
  });

  it("reads properties in sh:order with their presentation facts", () => {
    const alert = entity("Alert");
    expect(alert.properties.map((property) => property.key)).toEqual([
      "message",
      "created",
      "subject",
      "uuid",
    ]);

    const message = alert.properties[0];
    expect(message.label).toBe("metadata.labels.alert.message");
    expect(message.colSpan).toBe(2);
    expect(message.role).toBe("http://datashapes.org/dash#LabelRole");

    const created = alert.properties[1];
    expect(created.unit).toBe("DATETIME_DMY24");
    expect(created.sortable).toBe(true);
    expect(created.defaultSortDirection).toBe("desc");
  });

  it("reads view modes in order, with their config entries", () => {
    const component = entity("GithubProcessor");
    expect(component.viewModes.map((viewMode) => viewMode.mode)).toEqual([
      "ViewModesList",
      "ViewModesGrid",
      "ViewModesPipeline",
    ]);
    expect(component.viewModes[0].config).toEqual([
      { key: "multiLine", value: true },
      { key: "multiLineColumns", value: 3 },
    ]);
    expect(component.viewModes[1].config).toEqual([]);
  });

  it("keeps a property off the teaser when the declaration says so", () => {
    const component = entity("GithubProcessor");
    const runtime = component.properties.find(
      (property) => property.key === "runtime",
    );
    expect(runtime?.teaser).toBe(false);
    expect(runtime?.formatter).toBe("pill|auto");
  });
});

describe("rendering", () => {
  it("renders keyValue lines for every property, formatter included", () => {
    const rendered = renderInitialValues(entity("GithubProcessor"), 6);
    expect(rendered).toContain(
      'name: keyValue(key: "name", source: metadata)',
    );
    expect(rendered).toContain(
      'runtime: keyValue(key: "runtime", source: metadata, formatter: "pill|auto")',
    );
  });

  it("renders teaser metaData entries only for teaser properties", () => {
    const rendered = renderTeaserFields(entity("GithubProcessor"), 6);
    expect(rendered).toContain('label(input: "metadata.labels.name")');
    expect(rendered).toContain('colSpan(input: "2")');
    expect(rendered).not.toContain('key(input: "runtime")');
  });

  it("renders units as enum arguments", () => {
    const rendered = renderTeaserFields(entity("Alert"), 6);
    expect(rendered).toContain("unit(input: DATETIME_DMY24)");
  });

  it("renders the allowed view modes with config", () => {
    const rendered = renderViewModes(entity("GithubProcessor"), 4);
    expect(rendered).toContain("viewMode: ViewModesPipeline");
    expect(rendered).toContain('{ key: "multiLine", value: true }');
    expect(rendered).toContain('{ key: "multiLineColumns", value: 3 }');
    expect(rendered).toContain("...viewModes");
  });

  it("renders sort options from sortable properties", () => {
    const rendered = renderSortOptions(entity("Alert"), 4);
    expect(rendered).toContain('value: "created"');
    expect(rendered).toContain("isAsc(input: desc)");

    const pipeline = renderSortOptions(entity("Pipeline"), 4);
    expect(pipeline).toContain('value: "name"');
    expect(pipeline).not.toContain("isAsc");
  });
});

describe("full-file declarations", () => {
  it("renders the hidden type filter and the text filter", () => {
    const rendered = renderFilters(entity("GithubProcessor"), 4);
    expect(rendered).toContain('defaultValue(value: "githubProcessor")');
    expect(rendered).toContain("hidden(value: true)");
    expect(rendered).toContain('key: ["elody:1|metadata.name.value"]');
    expect(rendered).toContain("isDisplayedByDefault: true");
    expect(rendered).toContain("tooltip(value: true)");
  });

  it("renders context-menu action parameters, not behaviour", () => {
    const rendered = renderContextMenu(entity("GithubProcessor"), 6);
    expect(rendered).toContain("forceShowContextMenuActions(input: true)");
    expect(rendered).toContain("...basicContextMenuActions");
    expect(rendered).toContain("configure: doElodyAction {");
    expect(rendered).toContain('formQuery(input: "ProcessorConnectionsConfig")');
    expect(rendered).toContain('icon(input: "Link")');
  });

  it("renders the detail view with panel fields resolved from the property list", () => {
    const rendered = renderDetailView(entity("GithubProcessor"), 4);
    expect(rendered).toContain("size(size: seventy)");
    expect(rendered).toContain("column2: column {");
    expect(rendered).toContain('panelHeaderContent(panelHeaderContentInput: { label: "panel-labels.repository-info" })');
    // the panel field's label comes from the one property declaration
    expect(rendered).toContain('label(input: "metadata.labels.default-branch")');
    expect(rendered).toContain('importConfig: panels {');
  });

  it("refuses a panel field that no property declares", () => {
    const broken = JSON.parse(
      JSON.stringify(entity("GithubProcessor")),
    ) as UiEntity;
    broken.detail!.columns[0].elements[0].panels[0].fields.push("ghost");
    expect(() => renderDetailView(broken, 4)).toThrow(/ghost/);
  });

  it("renders the alert detail as the shape-driven element", () => {
    const rendered = renderDetailView(entity("Alert"), 4);
    expect(rendered).toContain("shaclShapeElement {");
    expect(rendered).toContain('fieldsKey(input: "shapeFields")');
  });

  it("emits a complete, generation-stamped file per file-mode entity", () => {
    const alertFile = renderEntityFile(entity("Alert"));
    expect(alertFile).toContain("GENERATED from src/ui/dishacled.ui.ttl");
    expect(alertFile).toContain("export const alertQueries = gql`");
    expect(alertFile).toContain("fragment minimalAlert on Alert {");
    expect(alertFile).toContain("fragment fullAlert on Alert {");
    expect(alertFile).toContain("shapeFields");
    expect(alertFile).toContain("fragment alertSortOptions on Alert {");
    expect(alertFile).toContain("fragment filtersForAlert on Alert {");
    expect(alertFile).toContain("fragment alertBulkOperations on Alert {");
    expect(alertFile).toContain("query GetAlertEntities(");
    // alert declares only the entities document
    expect(alertFile).not.toContain("query GetAlertFilters");

    const componentFile = renderEntityFile(entity("GithubProcessor"));
    expect(componentFile).toContain("processorConfig");
    expect(componentFile).toContain("...typePillsIntialValues");
    expect(componentFile).toContain("query GetGithubProcessorFilters($entityType: String!)");
    expect(componentFile).toContain("query GetGithubProcessorSortOptions($entityType: String!)");
    expect(componentFile).toContain("query GetGithubProcessorBulkOperations($entityType: String!)");
    // the two runtime form sources, with their exact signatures
    expect(componentFile).toContain(
      "query ProcessorRelationConfig($id: String!) {",
    );
    expect(componentFile).toContain("ProcessorConfigForm(id: $id)");
    expect(componentFile).toContain(
      "query ProcessorConnectionsConfig($id: String!, $parentEntityId: String)",
    );
    expect(componentFile).toContain(
      "ProcessorConnectionForm(id: $id, parentEntityId: $parentEntityId)",
    );
  });

  it("keeps the pipeline in region mode", () => {
    const pipeline = entity("Pipeline");
    expect(pipeline.emit).toBe("regions");
    expect(entity("Alert").emit).toBe("file");
  });
});

describe("replaceRegion", () => {
  const source = [
    "keep me",
    "  # >>> generated:demo from src/ui/dishacled.ui.ttl — do not edit by hand",
    "  old content",
    "  # <<< generated:demo",
    "keep me too",
  ].join("\n");

  it("swaps exactly the region between the markers", () => {
    const replaced = replaceRegion(source, "demo", "  new content");
    expect(replaced).toContain("new content");
    expect(replaced).not.toContain("old content");
    expect(replaced).toContain("keep me");
    expect(replaced).toContain("keep me too");
    expect(replaced).toContain(">>> generated:demo");
  });

  it("is idempotent", () => {
    const once = replaceRegion(source, "demo", "  new content");
    const twice = replaceRegion(once, "demo", "  new content");
    expect(twice).toBe(once);
  });

  it("refuses a region that is not there", () => {
    expect(() => replaceRegion(source, "missing", "x")).toThrow(/missing/);
  });
});
