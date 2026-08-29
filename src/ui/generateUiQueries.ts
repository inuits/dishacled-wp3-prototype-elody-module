/**
 * dishacled.ui.ttl -> the declarative sections of the *.queries.ts documents.
 *
 * The RDF declaration is the source; the GraphQL query documents are its
 * build artifact. This generator parses the triples (SHACL property shapes +
 * DASH roles + the small elody: presentation vocabulary), renders the
 * declarative regions — intialValues, teaser metadata, view modes, sort
 * options — and splices them into the query files between
 * `# >>> generated:<id>` / `# <<< generated:<id>` markers. Everything outside
 * the markers (context menus, bulk operations, filters, pickers) is
 * behaviour, stays hand-written, and is untouched.
 *
 * Run with `pnpm run generate:ui` after editing the ttl; `generate:ui:check`
 * fails when the documents have drifted from the declaration.
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Parser, type Quad } from "n3";

const SH = "http://www.w3.org/ns/shacl#";
const DASH = "http://datashapes.org/dash#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const ELODY = "https://elody.io/ns/ui#";

export type UiConfigEntry = { key: string; value: string | number | boolean };

export type UiViewMode = {
  mode: string;
  order: number;
  config: UiConfigEntry[];
};

export type UiProperty = {
  key: string;
  label?: string;
  order: number;
  colSpan?: number;
  unit?: string;
  formatter?: string;
  role?: string;
  teaser: boolean;
  sortable: boolean;
  defaultSortDirection?: string;
};

export type UiEntity = {
  graphqlType: string;
  viewModes: UiViewMode[];
  properties: UiProperty[];
};

// -- triples -> model --------------------------------------------------------

class Reading {
  private bySubject = new Map<string, Quad[]>();

  constructor(quads: Quad[]) {
    for (const quad of quads) {
      const key = quad.subject.value;
      const list = this.bySubject.get(key);
      if (list) list.push(quad);
      else this.bySubject.set(key, [quad]);
    }
  }

  subjectsOfType(typeIri: string): string[] {
    const subjects: string[] = [];
    for (const [subject, quads] of this.bySubject)
      if (
        quads.some(
          (quad) =>
            quad.predicate.value === `${RDF}type` &&
            quad.object.value === typeIri,
        )
      )
        subjects.push(subject);
    return subjects.sort();
  }

  values(subject: string, predicate: string): string[] {
    return (this.bySubject.get(subject) ?? [])
      .filter((quad) => quad.predicate.value === predicate)
      .map((quad) => quad.object.value);
  }

  value(subject: string, predicate: string): string | undefined {
    return this.values(subject, predicate)[0];
  }

  literal(
    subject: string,
    predicate: string,
  ): string | number | boolean | undefined {
    const quad = (this.bySubject.get(subject) ?? []).find(
      (candidate) => candidate.predicate.value === predicate,
    );
    if (!quad || quad.object.termType !== "Literal") return quad?.object.value;
    const datatype = quad.object.datatype?.value ?? "";
    if (datatype.endsWith("#boolean")) return quad.object.value === "true";
    if (datatype.endsWith("#integer") || datatype.endsWith("#decimal"))
      return Number(quad.object.value);
    return quad.object.value;
  }
}

const byOrder = (reading: Reading) => (a: string, b: string) =>
  Number(reading.value(a, `${SH}order`) ?? 0) -
  Number(reading.value(b, `${SH}order`) ?? 0);

export function parseUiDeclaration(ttl: string): UiEntity[] {
  const reading = new Reading(new Parser().parse(ttl));

  return reading.subjectsOfType(`${ELODY}EntityUi`).map((subject) => {
    const viewModes = reading
      .values(subject, `${ELODY}viewMode`)
      .sort(byOrder(reading))
      .map((node): UiViewMode => ({
        mode: String(reading.value(node, `${ELODY}mode`) ?? ""),
        order: Number(reading.value(node, `${SH}order`) ?? 0),
        config: reading.values(node, `${ELODY}config`).map(
          (entry): UiConfigEntry => ({
            key: String(reading.value(entry, `${ELODY}key`) ?? ""),
            value: reading.literal(entry, `${ELODY}value`) ?? "",
          }),
        ),
      }));

    const properties = reading
      .values(subject, `${SH}property`)
      .sort(byOrder(reading))
      .map((node): UiProperty => {
        const colSpan = reading.literal(node, `${ELODY}colSpan`);
        return {
          key: String(reading.value(node, `${SH}name`) ?? ""),
          label: reading.value(node, `${RDFS}label`),
          order: Number(reading.value(node, `${SH}order`) ?? 0),
          colSpan: typeof colSpan === "number" ? colSpan : undefined,
          unit: reading.value(node, `${ELODY}unit`),
          formatter: reading.value(node, `${ELODY}formatter`),
          role: reading.value(node, `${DASH}propertyRole`),
          teaser: reading.literal(node, `${ELODY}teaser`) !== false,
          sortable: reading.literal(node, `${ELODY}sortable`) === true,
          defaultSortDirection: reading.value(
            node,
            `${ELODY}defaultSortDirection`,
          ),
        };
      });

    return {
      graphqlType: String(reading.value(subject, `${ELODY}graphqlType`) ?? ""),
      viewModes,
      properties,
    };
  });
}

// -- model -> GraphQL sections ----------------------------------------------

const pad = (depth: number) => " ".repeat(depth);

export function renderInitialValues(entity: UiEntity, indent: number): string {
  return entity.properties
    .map((property) => {
      const formatter = property.formatter
        ? `, formatter: "${property.formatter}"`
        : "";
      return `${pad(indent)}${property.key}: keyValue(key: "${property.key}", source: metadata${formatter})`;
    })
    .join("\n");
}

export function renderTeaserFields(entity: UiEntity, indent: number): string {
  return entity.properties
    .filter((property) => property.teaser)
    .map((property) => {
      const lines = [
        `${pad(indent)}${property.key}: metaData {`,
        `${pad(indent + 2)}label(input: "${property.label ?? property.key}")`,
        `${pad(indent + 2)}key(input: "${property.key}")`,
      ];
      if (property.colSpan !== undefined)
        lines.push(`${pad(indent + 2)}colSpan(input: "${property.colSpan}")`);
      if (property.unit)
        lines.push(`${pad(indent + 2)}unit(input: ${property.unit})`);
      lines.push(`${pad(indent)}}`);
      return lines.join("\n");
    })
    .join("\n");
}

const configLiteral = (value: string | number | boolean): string =>
  typeof value === "string" ? `"${value}"` : String(value);

export function renderViewModes(entity: UiEntity, indent: number): string {
  const modes = entity.viewModes
    .map((viewMode) => {
      if (viewMode.config.length === 0)
        return `${pad(indent + 6)}{ viewMode: ${viewMode.mode} }`;
      const entries = viewMode.config
        .map(
          (entry) =>
            `${pad(indent + 10)}{ key: "${entry.key}", value: ${configLiteral(entry.value)} }`,
        )
        .join("\n");
      return [
        `${pad(indent + 6)}{`,
        `${pad(indent + 8)}viewMode: ${viewMode.mode}`,
        `${pad(indent + 8)}config: [`,
        entries,
        `${pad(indent + 8)}]`,
        `${pad(indent + 6)}}`,
      ].join("\n");
    })
    .join("\n");

  return [
    `${pad(indent)}allowedViewModes {`,
    `${pad(indent + 2)}viewModes(`,
    `${pad(indent + 4)}input: [`,
    modes,
    `${pad(indent + 4)}]`,
    `${pad(indent + 2)}) {`,
    `${pad(indent + 4)}...viewModes`,
    `${pad(indent + 2)}}`,
    `${pad(indent)}}`,
  ].join("\n");
}

export function renderSortOptions(entity: UiEntity, indent: number): string {
  const sortable = entity.properties.filter((property) => property.sortable);
  if (sortable.length === 0) return "";

  const options = sortable
    .map((property) =>
      [
        `${pad(indent + 6)}{`,
        `${pad(indent + 8)}icon: NoIcon`,
        `${pad(indent + 8)}label: "${property.label ?? property.key}"`,
        `${pad(indent + 8)}value: "${property.key}"`,
        `${pad(indent + 6)}}`,
      ].join("\n"),
    )
    .join("\n");

  const direction = sortable.find(
    (property) => property.defaultSortDirection,
  )?.defaultSortDirection;

  const lines = [
    `${pad(indent)}sortOptions {`,
    `${pad(indent + 2)}options(`,
    `${pad(indent + 4)}input: [`,
    options,
    `${pad(indent + 4)}]`,
    `${pad(indent + 2)}) {`,
    `${pad(indent + 4)}icon`,
    `${pad(indent + 4)}label`,
    `${pad(indent + 4)}value`,
    `${pad(indent + 2)}}`,
  ];
  if (direction) lines.push(`${pad(indent + 2)}isAsc(input: ${direction})`);
  lines.push(`${pad(indent)}}`);
  return lines.join("\n");
}

// -- splicing into the query files ------------------------------------------

const startMarker = (id: string) =>
  `# >>> generated:${id} from src/ui/dishacled.ui.ttl — do not edit by hand`;
const endMarker = (id: string) => `# <<< generated:${id}`;

export function replaceRegion(
  source: string,
  id: string,
  content: string,
): string {
  const lines = source.split("\n");
  const start = lines.findIndex((line) => line.includes(startMarker(id)));
  const end = lines.findIndex((line) => line.includes(endMarker(id)));
  if (start === -1 || end === -1 || end < start)
    throw new Error(`region "${id}" not found`);
  return [
    ...lines.slice(0, start + 1),
    ...(content ? [content] : []),
    ...lines.slice(end),
  ].join("\n");
}

// -- the files this declaration renders into ---------------------------------

type Target = {
  file: string;
  regions: (entities: Map<string, UiEntity>) => Record<string, string>;
};

const need = (entities: Map<string, UiEntity>, graphqlType: string): UiEntity => {
  const entity = entities.get(graphqlType);
  if (!entity) throw new Error(`no ui declaration for ${graphqlType}`);
  return entity;
};

const TARGETS: Target[] = [
  {
    file: "src/queries/entities/alert.queries.ts",
    regions: (entities) => {
      const alert = need(entities, "Alert");
      return {
        "alert-initial-values": renderInitialValues(alert, 6),
        "alert-view-modes": renderViewModes(alert, 4),
        "alert-teaser-fields": renderTeaserFields(alert, 6),
        "alert-sort-options": renderSortOptions(alert, 4),
      };
    },
  },
  {
    file: "src/queries/entities/githubProcessor.queries.ts",
    regions: (entities) => {
      const component = need(entities, "GithubProcessor");
      return {
        "component-initial-values": renderInitialValues(component, 6),
        "component-view-modes": renderViewModes(component, 4),
        "component-teaser-fields": renderTeaserFields(component, 6),
        "component-sort-options": renderSortOptions(component, 4),
      };
    },
  },
  {
    file: "src/queries/entities/pipeline.queries.ts",
    regions: (entities) => {
      const pipeline = need(entities, "Pipeline");
      return {
        "pipeline-initial-values": renderInitialValues(pipeline, 6),
        "pipeline-view-modes": renderViewModes(pipeline, 4),
        "pipeline-teaser-fields": renderTeaserFields(pipeline, 6),
        "pipeline-sort-options": renderSortOptions(pipeline, 4),
      };
    },
  },
];

export function generate(root: string, check = false): boolean {
  const declaration = readFileSync(
    join(root, "src/ui/dishacled.ui.ttl"),
    "utf-8",
  );
  const entities = new Map(
    parseUiDeclaration(declaration).map((entity) => [
      entity.graphqlType,
      entity,
    ]),
  );

  let clean = true;
  for (const target of TARGETS) {
    const path = join(root, target.file);
    const source = readFileSync(path, "utf-8");
    let patched = source;
    for (const [id, content] of Object.entries(target.regions(entities)))
      patched = replaceRegion(patched, id, content);
    if (patched === source) continue;
    clean = false;
    if (check) {
      console.error(`${target.file} is out of date with dishacled.ui.ttl`);
    } else {
      writeFileSync(path, patched);
      console.log(`updated ${target.file}`);
    }
  }
  return clean;
}

// tsx entry point: `pnpm run generate:ui` / `pnpm run generate:ui:check`
if (process.argv[1]?.includes("generateUiQueries")) {
  const check = process.argv.includes("--check");
  const clean = generate(process.cwd(), check);
  if (check && !clean) process.exit(1);
  if (check) console.log("query documents match dishacled.ui.ttl");
}
