/**
 * dishacled.ui.ttl -> the GraphQL query documents.
 *
 * The RDF declaration is the source; the query documents are its build
 * artifact. Two emission modes, per entity (`elody:emit`):
 *
 *  - "file": the WHOLE *.queries.ts is generated — fragments, filters,
 *    context-menu parameters, detail layout, standard queries and form-source
 *    documents. Someone configuring the instance touches only the triples.
 *  - "regions": the declarative sections are spliced into a hand-written file
 *    between `# >>> generated:<id>` / `# <<< generated:<id>` markers (the
 *    pipeline file, which still carries hand-written behaviour queries).
 *
 * The vocabulary keeps SHACL for what SHACL can say (sh:property, sh:name,
 * sh:order), DASH roles for what a field is on a card, and the small elody:
 * namespace for platform presentation and *references* to platform behaviour
 * (an action's type, form query and icon are parameters; the behaviour lives
 * in the platform). Run `pnpm run generate:ui` after editing the ttl;
 * `generate:ui:check` fails when the documents have drifted.
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

export type UiFilter = {
  alias: string;
  kind: string;
  order: number;
  key?: string;
  keyAsList: boolean;
  label?: string;
  defaultValues: string[];
  defaultValueAsList: boolean;
  hidden: boolean;
  displayedByDefault: boolean;
  tooltip: boolean;
};

export type UiAction = {
  alias: string;
  order: number;
  actionType: string;
  formQuery?: string;
  formFlow?: string;
  formTitle?: string;
  label?: string;
  icon?: string;
};

export type UiContextMenu = {
  forceShow: boolean;
  includeBasicActions: boolean;
  actions: UiAction[];
};

export type UiBulkOpContext = {
  activeViewMode: string;
  selection: string;
  tooltip: string;
};

export type UiBulkOpModal = {
  typeModal: string;
  formQuery?: string;
  formRelationType?: string;
  closeConfirmation: boolean;
  permission?: string;
};

export type UiBulkOperation = {
  value: string;
  order: number;
  icon?: string;
  label?: string;
  primary?: boolean;
  can: string[];
  context?: UiBulkOpContext;
  modal?: UiBulkOpModal;
};

export type UiCustomBulkOperations = {
  queryName: string;
  operations: UiBulkOperation[];
};

export type UiCreateFormField = {
  key: string;
  label?: string;
  order: number;
  inputType: string;
  required: boolean;
};

export type UiCreateForm = {
  queryName: string;
  label?: string;
  fields: UiCreateFormField[];
  submit?: {
    label?: string;
    icon?: string;
    actionQuery?: string;
    creationType?: string;
  };
};

export type UiRepetitiveStep = {
  key: string;
  order: number;
  label?: string;
  entityType?: string;
  createForm?: string;
  pickerQuery?: string;
  pickerFiltersQuery?: string;
  acceptedTypes: string[];
  maxSelection?: number;
  overviewFields: { key: string; label?: string; order: number }[];
};

export type UiRepetitiveForm = {
  queryName: string;
  label?: string;
  repeatable: boolean;
  refetchOnFinish: boolean;
  steps: UiRepetitiveStep[];
  finalize?: { fromStep: string; relationType: string };
};

export type UiPickerResult = { type: string; fragment: string; order: number };

export type UiPicker = {
  queryName: string;
  filtersQueryName: string;
  order: number;
  results: UiPickerResult[];
  filters: UiFilter[];
};

export type UiPanel = {
  alias: string;
  order: number;
  label?: string;
  panelType: string;
  collapsed: boolean;
  editable: boolean;
  fields: string[];
};

export type UiElement = {
  kind: "shaclShape" | "window" | "list";
  order: number;
  alias?: string;
  label?: string;
  fieldsKey?: string;
  collapsed?: boolean;
  expandButton?: boolean;
  panels: UiPanel[];
  // list-element parameters (all references to platform machinery)
  entityTypes: string[];
  relationType?: string;
  customQuery?: string;
  customQueryFilters?: string;
  searchInputType?: string;
  customBulkOperations?: string;
  pickerList?: string;
  pickerFilters?: string;
};

export type UiColumn = { order: number; size: string; elements: UiElement[] };

export type UiDetail = {
  shapeDriven: boolean;
  fragmentFields: string[];
  columns: UiColumn[];
};

export type UiFormSource = {
  queryName: string;
  field: string;
  withParent: boolean;
};

export type UiEntity = {
  graphqlType: string;
  emit: "file" | "regions";
  documents: string[];
  typePills: boolean;
  processorConfig: boolean;
  viewModes: UiViewMode[];
  properties: UiProperty[];
  filters: UiFilter[];
  contextMenu?: UiContextMenu;
  detail?: UiDetail;
  formSources: UiFormSource[];
  bulkOperations: UiBulkOperation[];
  customBulkOperations: UiCustomBulkOperations[];
  createForms: UiCreateForm[];
  repetitiveForms: UiRepetitiveForm[];
  pickers: UiPicker[];
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

    const readFilter = (node: string): UiFilter => ({
      alias: String(reading.value(node, `${ELODY}alias`) ?? ""),
      kind: String(reading.value(node, `${ELODY}filterKind`) ?? "text"),
      order: Number(reading.value(node, `${SH}order`) ?? 0),
      key: reading.value(node, `${ELODY}key`),
      keyAsList: reading.literal(node, `${ELODY}keyAsList`) !== false,
      label: reading.value(node, `${RDFS}label`),
      defaultValues: reading.values(node, `${ELODY}defaultValue`),
      defaultValueAsList:
        reading.literal(node, `${ELODY}defaultValueAsList`) === true,
      hidden: reading.literal(node, `${ELODY}hidden`) === true,
      displayedByDefault:
        reading.literal(node, `${ELODY}displayedByDefault`) === true,
      tooltip: reading.literal(node, `${ELODY}tooltip`) === true,
    });

    const filters = reading
      .values(subject, `${ELODY}filter`)
      .sort(byOrder(reading))
      .map(readFilter);

    const readBulkOperation = (node: string): UiBulkOperation => {
      const contextNode = reading.value(node, `${ELODY}context`);
      const modalNode = reading.value(node, `${ELODY}modal`);
      const primary = reading.literal(node, `${ELODY}primary`);
      return {
        value: String(reading.value(node, `${ELODY}value`) ?? ""),
        order: Number(reading.value(node, `${SH}order`) ?? 0),
        icon: reading.value(node, `${ELODY}icon`),
        label: reading.value(node, `${RDFS}label`),
        primary: typeof primary === "boolean" ? primary : undefined,
        can: reading.values(node, `${ELODY}can`),
        context: contextNode
          ? {
              activeViewMode: String(
                reading.value(contextNode, `${ELODY}activeViewMode`) ?? "",
              ),
              selection: String(
                reading.value(contextNode, `${ELODY}selection`) ?? "",
              ),
              tooltip: String(
                reading.value(contextNode, `${ELODY}tooltip`) ?? "",
              ),
            }
          : undefined,
        modal: modalNode
          ? {
              typeModal: String(
                reading.value(modalNode, `${ELODY}typeModal`) ?? "",
              ),
              formQuery: reading.value(modalNode, `${ELODY}formQuery`),
              formRelationType: reading.value(
                modalNode,
                `${ELODY}formRelationType`,
              ),
              closeConfirmation:
                reading.literal(modalNode, `${ELODY}closeConfirmation`) ===
                true,
              permission: reading.value(modalNode, `${ELODY}permission`),
            }
          : undefined,
      };
    };

    const bulkOperations = reading
      .values(subject, `${ELODY}bulkOperation`)
      .sort(byOrder(reading))
      .map(readBulkOperation);

    const customBulkOperations = reading
      .values(subject, `${ELODY}customBulkOperations`)
      .map((node): UiCustomBulkOperations => ({
        queryName: String(reading.value(node, `${ELODY}queryName`) ?? ""),
        operations: reading
          .values(node, `${ELODY}operation`)
          .sort(byOrder(reading))
          .map(readBulkOperation),
      }));

    const createForms = reading
      .values(subject, `${ELODY}createForm`)
      .map((node): UiCreateForm => {
        const submitNode = reading.value(node, `${ELODY}submit`);
        return {
          queryName: String(reading.value(node, `${ELODY}queryName`) ?? ""),
          label: reading.value(node, `${RDFS}label`),
          fields: reading
            .values(node, `${ELODY}field`)
            .sort(byOrder(reading))
            .map((field): UiCreateFormField => ({
              key: String(reading.value(field, `${SH}name`) ?? ""),
              label: reading.value(field, `${RDFS}label`),
              order: Number(reading.value(field, `${SH}order`) ?? 0),
              inputType: String(
                reading.value(field, `${ELODY}inputType`) ?? "baseTextField",
              ),
              required: reading.literal(field, `${ELODY}required`) === true,
            })),
          submit: submitNode
            ? {
                label: reading.value(submitNode, `${RDFS}label`),
                icon: reading.value(submitNode, `${ELODY}icon`),
                actionQuery: reading.value(submitNode, `${ELODY}actionQuery`),
                creationType: reading.value(
                  submitNode,
                  `${ELODY}creationType`,
                ),
              }
            : undefined,
        };
      });

    const repetitiveForms = reading
      .values(subject, `${ELODY}repetitiveForm`)
      .map((node): UiRepetitiveForm => {
        const finalizeNode = reading.value(node, `${ELODY}finalize`);
        return {
          queryName: String(reading.value(node, `${ELODY}queryName`) ?? ""),
          label: reading.value(node, `${RDFS}label`),
          repeatable: reading.literal(node, `${ELODY}repeatable`) === true,
          refetchOnFinish:
            reading.literal(node, `${ELODY}refetchOnFinish`) === true,
          steps: reading
            .values(node, `${ELODY}step`)
            .sort(byOrder(reading))
            .map((step): UiRepetitiveStep => ({
              key: String(reading.value(step, `${ELODY}key`) ?? ""),
              order: Number(reading.value(step, `${SH}order`) ?? 0),
              label: reading.value(step, `${RDFS}label`),
              entityType: reading.value(step, `${ELODY}entityType`),
              createForm: reading.value(step, `${ELODY}createForm`),
              pickerQuery: reading.value(step, `${ELODY}pickerQuery`),
              pickerFiltersQuery: reading.value(
                step,
                `${ELODY}pickerFiltersQuery`,
              ),
              acceptedTypes: reading.values(step, `${ELODY}acceptedTypes`),
              maxSelection: (() => {
                const value = reading.literal(step, `${ELODY}maxSelection`);
                return typeof value === "number" ? value : undefined;
              })(),
              overviewFields: reading
                .values(step, `${ELODY}overviewField`)
                .sort(byOrder(reading))
                .map((field) => ({
                  key: String(reading.value(field, `${ELODY}key`) ?? ""),
                  label: reading.value(field, `${RDFS}label`),
                  order: Number(reading.value(field, `${SH}order`) ?? 0),
                })),
            })),
          finalize: finalizeNode
            ? {
                fromStep: String(
                  reading.value(finalizeNode, `${ELODY}fromStep`) ?? "",
                ),
                relationType: String(
                  reading.value(finalizeNode, `${ELODY}relationType`) ?? "",
                ),
              }
            : undefined,
        };
      });

    const pickers = reading
      .values(subject, `${ELODY}picker`)
      .sort(byOrder(reading))
      .map((node): UiPicker => ({
        queryName: String(reading.value(node, `${ELODY}queryName`) ?? ""),
        filtersQueryName: String(
          reading.value(node, `${ELODY}filtersQueryName`) ?? "",
        ),
        order: Number(reading.value(node, `${SH}order`) ?? 0),
        results: reading
          .values(node, `${ELODY}result`)
          .sort(byOrder(reading))
          .map((result): UiPickerResult => ({
            type: String(reading.value(result, `${ELODY}type`) ?? ""),
            fragment: String(reading.value(result, `${ELODY}fragment`) ?? ""),
            order: Number(reading.value(result, `${SH}order`) ?? 0),
          })),
        filters: reading
          .values(node, `${ELODY}filter`)
          .sort(byOrder(reading))
          .map(readFilter),
      }));

    const menuNode = reading.value(subject, `${ELODY}contextMenu`);
    const contextMenu: UiContextMenu | undefined = menuNode
      ? {
          forceShow: reading.literal(menuNode, `${ELODY}forceShow`) === true,
          includeBasicActions:
            reading.literal(menuNode, `${ELODY}includeBasicActions`) === true,
          actions: reading
            .values(menuNode, `${ELODY}action`)
            .sort(byOrder(reading))
            .map((node): UiAction => ({
              alias: String(reading.value(node, `${ELODY}alias`) ?? ""),
              order: Number(reading.value(node, `${SH}order`) ?? 0),
              actionType: String(
                reading.value(node, `${ELODY}actionType`) ?? "",
              ),
              formQuery: reading.value(node, `${ELODY}formQuery`),
              formFlow: reading.value(node, `${ELODY}formFlow`),
              formTitle: reading.value(node, `${ELODY}formTitle`),
              label: reading.value(node, `${RDFS}label`),
              icon: reading.value(node, `${ELODY}icon`),
            })),
        }
      : undefined;

    const detailNode = reading.value(subject, `${ELODY}detail`);
    const detail: UiDetail | undefined = detailNode
      ? {
          shapeDriven:
            reading.literal(detailNode, `${ELODY}shapeDriven`) === true,
          fragmentFields: reading.values(detailNode, `${ELODY}fragmentField`),
          columns: reading
            .values(detailNode, `${ELODY}column`)
            .sort(byOrder(reading))
            .map((column): UiColumn => ({
              order: Number(reading.value(column, `${SH}order`) ?? 0),
              size: String(reading.value(column, `${ELODY}size`) ?? "hundred"),
              elements: reading
                .values(column, `${ELODY}element`)
                .sort(byOrder(reading))
                .map((element): UiElement => ({
                  kind: reading
                    .values(element, `${RDF}type`)
                    .some((type) => type === `${ELODY}ShaclShapeElement`)
                    ? "shaclShape"
                    : reading
                          .values(element, `${RDF}type`)
                          .some((type) => type === `${ELODY}ListElement`)
                      ? "list"
                      : "window",
                  order: Number(reading.value(element, `${SH}order`) ?? 0),
                  alias: reading.value(element, `${ELODY}alias`),
                  label: reading.value(element, `${RDFS}label`),
                  entityTypes: reading.values(element, `${ELODY}entityTypes`),
                  relationType: reading.value(element, `${ELODY}relationType`),
                  customQuery: reading.value(element, `${ELODY}customQuery`),
                  customQueryFilters: reading.value(
                    element,
                    `${ELODY}customQueryFilters`,
                  ),
                  searchInputType: reading.value(
                    element,
                    `${ELODY}searchInputType`,
                  ),
                  customBulkOperations: reading.value(
                    element,
                    `${ELODY}customBulkOperations`,
                  ),
                  pickerList: reading.value(element, `${ELODY}pickerList`),
                  pickerFilters: reading.value(
                    element,
                    `${ELODY}pickerFilters`,
                  ),
                  fieldsKey: reading.value(element, `${ELODY}fieldsKey`),
                  collapsed:
                    reading.literal(element, `${ELODY}collapsed`) === true,
                  expandButton:
                    reading.literal(element, `${ELODY}expandButton`) === true,
                  panels: reading
                    .values(element, `${ELODY}panel`)
                    .sort(byOrder(reading))
                    .map((panel): UiPanel => ({
                      alias: String(
                        reading.value(panel, `${ELODY}alias`) ?? "",
                      ),
                      order: Number(reading.value(panel, `${SH}order`) ?? 0),
                      label: reading.value(panel, `${RDFS}label`),
                      panelType: String(
                        reading.value(panel, `${ELODY}panelType`) ?? "metadata",
                      ),
                      collapsed:
                        reading.literal(panel, `${ELODY}collapsed`) === true,
                      editable:
                        reading.literal(panel, `${ELODY}editable`) === true,
                      fields: reading.values(panel, `${ELODY}field`),
                    })),
                })),
            })),
        }
      : undefined;

    return {
      graphqlType: String(reading.value(subject, `${ELODY}graphqlType`) ?? ""),
      emit:
        reading.value(subject, `${ELODY}emit`) === "file" ? "file" : "regions",
      documents: reading.values(subject, `${ELODY}documents`),
      typePills: reading.literal(subject, `${ELODY}typePills`) === true,
      processorConfig:
        reading.literal(subject, `${ELODY}processorConfig`) === true,
      viewModes,
      properties,
      filters,
      contextMenu,
      detail,
      formSources: reading
        .values(subject, `${ELODY}formSource`)
        .map((node): UiFormSource => ({
          queryName: String(reading.value(node, `${ELODY}queryName`) ?? ""),
          field: String(reading.value(node, `${ELODY}field`) ?? ""),
          withParent: reading.literal(node, `${ELODY}withParent`) === true,
        })),
      bulkOperations,
      customBulkOperations,
      createForms,
      repetitiveForms,
      pickers,
    };
  });
}

// -- model -> GraphQL sections ----------------------------------------------

const pad = (depth: number) => " ".repeat(depth);
const lowerFirst = (value: string) =>
  value.charAt(0).toLowerCase() + value.slice(1);

export function renderInitialValues(
  entity: UiEntity,
  indent: number,
  withFormatters = true,
): string {
  return entity.properties
    .map((property) => {
      const formatter =
        withFormatters && property.formatter
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

const filterDefaultLiteral = (filter: UiFilter): string => {
  if (filter.defaultValueAsList)
    return `[${filter.defaultValues.map((value) => `"${value}"`).join(", ")}]`;
  return `"${filter.defaultValues[0] ?? ""}"`;
};

export function renderFilters(entity: UiEntity, indent: number): string {
  return renderFilterList(entity.filters, indent);
}

export function renderFilterList(filters: UiFilter[], indent: number): string {
  const entries = filters.map((filter) => {
    if (filter.kind === "type")
      return [
        `${pad(indent + 2)}${filter.alias}: advancedFilter(type: type) {`,
        `${pad(indent + 4)}type`,
        `${pad(indent + 4)}defaultValue(value: ${filterDefaultLiteral(filter)})`,
        `${pad(indent + 4)}hidden(value: ${filter.hidden})`,
        `${pad(indent + 2)}}`,
      ].join("\n");

    if (filter.kind === "selection") {
      const key = filter.keyAsList
        ? `["${filter.key}"]`
        : `"${filter.key}"`;
      const selection = [
        "type",
        "key",
        ...(filter.defaultValues.length > 0
          ? [`defaultValue(value: ${filterDefaultLiteral(filter)})`]
          : []),
        ...(filter.hidden ? ["hidden(value: true)"] : []),
      ];
      return [
        `${pad(indent + 2)}${filter.alias}: advancedFilter(type: selection, key: ${key}) {`,
        ...selection.map((field) => `${pad(indent + 4)}${field}`),
        `${pad(indent + 2)}}`,
      ].join("\n");
    }

    const args = [
      `type: ${filter.kind}`,
      ...(filter.key ? [`key: ["${filter.key}"]`] : []),
      ...(filter.label ? [`label: "${filter.label}"`] : []),
      ...(filter.displayedByDefault ? ["isDisplayedByDefault: true"] : []),
    ];
    const selection = [
      "type",
      ...(filter.key ? ["key"] : []),
      ...(filter.label ? ["label"] : []),
      ...(filter.displayedByDefault ? ["isDisplayedByDefault"] : []),
      ...(filter.tooltip ? ["tooltip(value: true)"] : []),
    ];
    return [
      `${pad(indent + 2)}${filter.alias}: advancedFilter(`,
      ...args.map((argument) => `${pad(indent + 4)}${argument}`),
      `${pad(indent + 2)}) {`,
      ...selection.map((field) => `${pad(indent + 4)}${field}`),
      `${pad(indent + 2)}}`,
    ].join("\n");
  });

  return [
    `${pad(indent)}advancedFilters {`,
    ...entries,
    `${pad(indent)}}`,
  ].join("\n");
}

export function renderContextMenu(entity: UiEntity, indent: number): string {
  const menu = entity.contextMenu;
  if (!menu) return "";

  const lines: string[] = [];
  if (menu.forceShow)
    lines.push(`${pad(indent)}forceShowContextMenuActions(input: true)`);
  lines.push(`${pad(indent)}contextMenuActions {`);
  if (menu.includeBasicActions)
    lines.push(`${pad(indent + 2)}...basicContextMenuActions`);
  for (const action of menu.actions) {
    lines.push(`${pad(indent + 2)}${action.alias}: doElodyAction {`);
    lines.push(`${pad(indent + 4)}action(input: ${action.actionType})`);
    if (action.formQuery)
      lines.push(`${pad(indent + 4)}formQuery(input: "${action.formQuery}")`);
    if (action.formFlow)
      lines.push(`${pad(indent + 4)}formFlow(input: ${action.formFlow})`);
    if (action.formTitle)
      lines.push(`${pad(indent + 4)}formTitle(input: "${action.formTitle}")`);
    if (action.label)
      lines.push(`${pad(indent + 4)}label(input: "${action.label}")`);
    if (action.icon)
      lines.push(`${pad(indent + 4)}icon(input: "${action.icon}")`);
    lines.push(`${pad(indent + 4)}__typename`);
    lines.push(`${pad(indent + 2)}}`);
  }
  lines.push(`${pad(indent)}}`);
  return lines.join("\n");
}

export function renderBulkOperationOptions(
  operations: UiBulkOperation[],
  indent: number,
): string {
  const entries = operations.map((operation) => {
    const lines = [`${pad(indent + 6)}{`];
    if (operation.icon)
      lines.push(`${pad(indent + 8)}icon: ${operation.icon}`);
    if (operation.label)
      lines.push(`${pad(indent + 8)}label: "${operation.label}"`);
    lines.push(`${pad(indent + 8)}value: "${operation.value}"`);
    if (operation.primary !== undefined)
      lines.push(`${pad(indent + 8)}primary: ${operation.primary}`);
    if (operation.can.length > 0)
      lines.push(
        `${pad(indent + 8)}can: [${operation.can.map((entry) => `"${entry}"`).join(", ")}]`,
      );
    if (operation.context) {
      lines.push(`${pad(indent + 8)}actionContext: {`);
      lines.push(
        `${pad(indent + 10)}activeViewMode: ${operation.context.activeViewMode}`,
      );
      lines.push(
        `${pad(indent + 10)}entitiesSelectionType: ${operation.context.selection}`,
      );
      lines.push(
        `${pad(indent + 10)}labelForTooltip: "${operation.context.tooltip}"`,
      );
      lines.push(`${pad(indent + 8)}}`);
    }
    if (operation.modal) {
      lines.push(`${pad(indent + 8)}bulkOperationModal: {`);
      lines.push(`${pad(indent + 10)}typeModal: ${operation.modal.typeModal}`);
      if (operation.modal.formQuery)
        lines.push(
          `${pad(indent + 10)}formQuery: "${operation.modal.formQuery}"`,
        );
      if (operation.modal.formRelationType)
        lines.push(
          `${pad(indent + 10)}formRelationType: "${operation.modal.formRelationType}"`,
        );
      lines.push(
        `${pad(indent + 10)}askForCloseConfirmation: ${operation.modal.closeConfirmation}`,
      );
      if (operation.modal.permission)
        lines.push(
          `${pad(indent + 10)}neededPermission: ${operation.modal.permission}`,
        );
      lines.push(`${pad(indent + 8)}}`);
    }
    lines.push(`${pad(indent + 6)}}`);
    return lines.join("\n");
  });

  const input =
    operations.length === 0
      ? `${pad(indent + 2)}options(input: []) {`
      : [
          `${pad(indent + 2)}options(`,
          `${pad(indent + 4)}input: [`,
          ...entries,
          `${pad(indent + 4)}]`,
          `${pad(indent + 2)}) {`,
        ].join("\n");

  return [
    `${pad(indent)}bulkOperationOptions {`,
    input,
    `${pad(indent + 4)}icon`,
    `${pad(indent + 4)}label`,
    `${pad(indent + 4)}value`,
    `${pad(indent + 4)}primary`,
    `${pad(indent + 4)}can`,
    `${pad(indent + 4)}actionContext {`,
    `${pad(indent + 6)}...actionContext`,
    `${pad(indent + 4)}}`,
    `${pad(indent + 4)}bulkOperationModal {`,
    `${pad(indent + 6)}...bulkOperationModal`,
    `${pad(indent + 4)}}`,
    `${pad(indent + 2)}}`,
    `${pad(indent)}}`,
  ].join("\n");
}

export function renderCreateForm(form: UiCreateForm): string {
  const fields = form.fields.map((field) => {
    const lines = [
      `          ${field.key}: metaData {`,
      `            label(input: "${field.label ?? field.key}")`,
      `            key(input: "${field.key}")`,
      `            inputField(type: ${field.inputType}) {`,
      "              ...inputfield",
    ];
    if (field.required) {
      lines.push("              validation(input: { value: required }) {");
      lines.push("                ...validation");
      lines.push("              }");
    }
    lines.push("            }");
    lines.push("          }");
    return lines.join("\n");
  });

  const submit = form.submit
    ? [
        "          createAction: action {",
        `            label(input: "${form.submit.label ?? ""}")`,
        `            icon(input: ${form.submit.icon ?? "NoIcon"})`,
        "            actionType(input: submit)",
        `            actionQuery(input: "${form.submit.actionQuery ?? ""}")`,
        `            creationType(input: ${form.submit.creationType ?? ""})`,
        "            showsFormErrors(input: true)",
        "          }",
      ].join("\n")
    : "";

  return [
    `  query ${form.queryName} {`,
    "    GetDynamicForm {",
    `      label(input: "${form.label ?? ""}")`,
    "      name: formTab {",
    "        formFields {",
    fields.join("\n"),
    ...(submit ? [submit] : []),
    "        }",
    "      }",
    "    }",
    "  }",
  ].join("\n");
}

export function renderRepetitiveForm(form: UiRepetitiveForm): string {
  const steps = form.steps.map((step) => {
    const lines = [
      `      ${step.key}: steps {`,
      `        key(input: "${step.key}")`,
      `        label(input: "${step.label ?? ""}")`,
    ];
    if (step.entityType)
      lines.push(`        entityType(input: "${step.entityType}")`);
    if (step.createForm)
      lines.push(`        createForm(input: "${step.createForm}")`);
    if (step.pickerQuery)
      lines.push(`        pickerQuery(input: "${step.pickerQuery}")`);
    if (step.pickerFiltersQuery)
      lines.push(
        `        pickerFiltersQuery(input: "${step.pickerFiltersQuery}")`,
      );
    if (step.acceptedTypes.length > 0)
      lines.push(
        `        acceptedTypes(input: [${step.acceptedTypes.map((entry) => `"${entry}"`).join(", ")}])`,
      );
    if (step.maxSelection !== undefined)
      lines.push(`        maxSelection(input: ${step.maxSelection})`);
    if (step.overviewFields.length > 0) {
      lines.push("        overviewFields(");
      lines.push("          input: [");
      for (const field of step.overviewFields)
        lines.push(
          `            { key: "${field.key}", label: "${field.label ?? field.key}" }`,
        );
      lines.push("          ]");
      lines.push("        ) {");
      lines.push("          key");
      lines.push("          label");
      lines.push("        }");
    }
    lines.push("      }");
    return lines.join("\n");
  });

  const finalize = form.finalize
    ? [
        "      finalizeOnHost {",
        `        fromStep(input: "${form.finalize.fromStep}")`,
        `        relationType(input: "${form.finalize.relationType}")`,
        "      }",
      ].join("\n")
    : "";

  return [
    `  query ${form.queryName} {`,
    "    GetRepetitiveForm {",
    `      label(input: "${form.label ?? ""}")`,
    `      repeatable(input: ${form.repeatable})`,
    `      refetchOnFinish(input: ${form.refetchOnFinish})`,
    steps.join("\n"),
    ...(finalize ? [finalize] : []),
    "    }",
    "  }",
  ].join("\n");
}

export function renderPicker(picker: UiPicker): string {
  const results = picker.results
    .map((result) =>
      [
        `        ... on ${result.type} {`,
        `          ...${result.fragment}`,
        "        }",
      ].join("\n"),
    )
    .join("\n");

  const list = [
    `  query ${picker.queryName}(`,
    "    $type: Entitytyping!",
    "    $limit: Int",
    "    $skip: Int",
    "    $searchValue: SearchFilter!",
    "    $advancedSearchValue: [FilterInput]",
    "    $advancedFilterInputs: [AdvancedFilterInput!]!",
    "    $searchInputType: SearchInputType",
    "  ) {",
    "    Entities(",
    "      type: $type",
    "      limit: $limit",
    "      skip: $skip",
    "      searchValue: $searchValue",
    "      advancedSearchValue: $advancedSearchValue",
    "      advancedFilterInputs: $advancedFilterInputs",
    "      searchInputType: $searchInputType",
    "    ) {",
    "      count",
    "      limit",
    "      results {",
    "        id",
    "        uuid",
    "        type",
    results,
    "      }",
    "      __typename",
    "    }",
    "  }",
  ].join("\n");

  const filters = [
    `  query ${picker.filtersQueryName}($entityType: String!) {`,
    "    EntityTypeFilters(type: $entityType) {",
    renderFilterList(picker.filters, 6),
    "    }",
    "  }",
  ].join("\n");

  return `${list}\n\n${filters}`;
}

export function renderDetailView(entity: UiEntity, indent: number): string {
  const detail = entity.detail;
  if (!detail || detail.columns.length === 0) return "";

  const propertyByKey = new Map(
    entity.properties.map((property) => [property.key, property]),
  );

  const renderPanel = (panel: UiPanel, depth: number): string => {
    const lines = [
      `${pad(depth)}${panel.alias}: panels {`,
      `${pad(depth + 2)}panelHeaderContent(panelHeaderContentInput: { label: "${panel.label ?? ""}" }) {`,
      `${pad(depth + 4)}label`,
      `${pad(depth + 2)}}`,
      `${pad(depth + 2)}panelType(input: ${panel.panelType})`,
      `${pad(depth + 2)}isCollapsed(input: ${panel.collapsed})`,
      `${pad(depth + 2)}isEditable(input: ${panel.editable})`,
    ];
    for (const key of panel.fields) {
      const property = propertyByKey.get(key);
      if (!property)
        throw new Error(
          `panel "${panel.alias}" references undeclared property "${key}"`,
        );
      lines.push(`${pad(depth + 2)}${key}: metaData {`);
      lines.push(
        `${pad(depth + 4)}label(input: "${property.label ?? property.key}")`,
      );
      lines.push(`${pad(depth + 4)}key(input: "${key}")`);
      lines.push(`${pad(depth + 2)}}`);
    }
    lines.push(`${pad(depth)}}`);
    return lines.join("\n");
  };

  const renderElement = (element: UiElement, depth: number): string => {
    if (element.kind === "list") {
      const alias = element.alias ? `${element.alias}: ` : "";
      const lines = [
        `${pad(depth)}${alias}entityListElement {`,
        `${pad(depth + 2)}label(input: "${element.label ?? ""}")`,
        `${pad(depth + 2)}isCollapsed(input: ${element.collapsed ?? false})`,
      ];
      if (element.entityTypes.length > 0)
        lines.push(
          `${pad(depth + 2)}entityTypes(input: [${element.entityTypes.join(", ")}])`,
        );
      if (element.relationType)
        lines.push(
          `${pad(depth + 2)}relationType: label(input: "${element.relationType}")`,
        );
      if (element.customQuery)
        lines.push(
          `${pad(depth + 2)}customQuery(input: "${element.customQuery}")`,
        );
      if (element.customQueryFilters)
        lines.push(
          `${pad(depth + 2)}customQueryFilters(input: "${element.customQueryFilters}")`,
        );
      if (element.searchInputType)
        lines.push(
          `${pad(depth + 2)}searchInputType(input: "${element.searchInputType}")`,
        );
      if (element.customBulkOperations)
        lines.push(
          `${pad(depth + 2)}customBulkOperations(input: "${element.customBulkOperations}")`,
        );
      if (element.pickerList)
        lines.push(
          `${pad(depth + 2)}customQueryEntityPickerList(input: "${element.pickerList}")`,
        );
      if (element.pickerFilters)
        lines.push(
          `${pad(depth + 2)}customQueryEntityPickerListFilters(input: "${element.pickerFilters}")`,
        );
      lines.push(`${pad(depth)}}`);
      return lines.join("\n");
    }
    if (element.kind === "shaclShape")
      return [
        `${pad(depth)}shaclShapeElement {`,
        `${pad(depth + 2)}label(input: "${element.label ?? ""}")`,
        `${pad(depth + 2)}fieldsKey(input: "${element.fieldsKey ?? "shapeFields"}")`,
        `${pad(depth + 2)}isCollapsed(input: ${element.collapsed ?? false})`,
        `${pad(depth)}}`,
      ].join("\n");

    const lines = [
      `${pad(depth)}windowElement {`,
      `${pad(depth + 2)}label(input: "${element.label ?? ""}")`,
    ];
    if (element.expandButton) {
      lines.push(`${pad(depth + 2)}expandButtonOptions {`);
      lines.push(`${pad(depth + 4)}shown(input: true)`);
      lines.push(`${pad(depth + 2)}}`);
    }
    for (const panel of element.panels)
      lines.push(renderPanel(panel, depth + 2));
    lines.push(`${pad(depth)}}`);
    return lines.join("\n");
  };

  const columns = detail.columns.map((column, index) => {
    const alias = index === 0 ? "column" : `column${index + 1}: column`;
    return [
      `${pad(indent + 2)}${alias} {`,
      `${pad(indent + 4)}size(size: ${column.size})`,
      `${pad(indent + 4)}elements {`,
      ...column.elements.map((element) => renderElement(element, indent + 6)),
      `${pad(indent + 4)}}`,
      `${pad(indent + 2)}}`,
    ].join("\n");
  });

  return [`${pad(indent)}entityView {`, ...columns, `${pad(indent)}}`].join(
    "\n",
  );
}

// -- whole-file emission -----------------------------------------------------

export function renderEntityFile(entity: UiEntity): string {
  const type = entity.graphqlType;
  const low = lowerFirst(type);
  const fragments: string[] = [];

  // minimal fragment: the listing card
  const minimal: string[] = [`  fragment minimal${type} on ${type} {`];
  if (entity.processorConfig) minimal.push("    processorConfig");
  minimal.push("    intialValues {");
  if (entity.typePills) minimal.push("      ...typePillsIntialValues");
  minimal.push(renderInitialValues(entity, 6));
  minimal.push("    }");
  minimal.push("    relationValues");
  minimal.push(renderViewModes(entity, 4));
  minimal.push("    teaserMetadata {");
  if (entity.typePills) minimal.push("      ...typePillsTeaserMetadata");
  const contextMenu = renderContextMenu(entity, 6);
  if (contextMenu) minimal.push(contextMenu);
  minimal.push(renderTeaserFields(entity, 6));
  minimal.push("    }");
  minimal.push("    ...minimalBaseEntity");
  minimal.push("  }");
  fragments.push(minimal.join("\n"));

  // full fragment: the detail page
  if (entity.detail) {
    const full: string[] = [`  fragment full${type} on ${type} {`];
    if (entity.detail.shapeDriven) full.push("    shapeFields");
    full.push("    intialValues {");
    // no formatters here: the detail panels render the raw values
    full.push(renderInitialValues(entity, 6, false));
    full.push("    }");
    full.push("    relationValues");
    for (const field of entity.detail.fragmentFields)
      full.push(`    ${field}`);
    full.push(renderDetailView(entity, 4));
    full.push("  }");
    fragments.push(full.join("\n"));
  }

  const sort = renderSortOptions(entity, 4);
  if (sort)
    fragments.push(
      [`  fragment ${low}SortOptions on ${type} {`, sort, "  }"].join("\n"),
    );

  if (entity.filters.length > 0)
    fragments.push(
      [
        `  fragment filtersFor${type} on ${type} {`,
        renderFilters(entity, 4),
        "  }",
      ].join("\n"),
    );

  fragments.push(
    [
      `  fragment ${low}BulkOperations on ${type} {`,
      renderBulkOperationOptions(entity.bulkOperations, 4),
      "  }",
    ].join("\n"),
  );

  const documents: string[] = [];
  if (entity.documents.includes("entities"))
    documents.push(
      [
        `  query Get${type}Entities(`,
        "    $type: Entitytyping!",
        "    $limit: Int",
        "    $skip: Int",
        "    $searchValue: SearchFilter!",
        "    $advancedSearchValue: [FilterInput]",
        "    $advancedFilterInputs: [AdvancedFilterInput!]!",
        "    $searchInputType: SearchInputType",
        "  ) {",
        "    Entities(",
        "      type: $type",
        "      limit: $limit",
        "      skip: $skip",
        "      searchValue: $searchValue",
        "      advancedSearchValue: $advancedSearchValue",
        "      advancedFilterInputs: $advancedFilterInputs",
        "      searchInputType: $searchInputType",
        "    ) {",
        "      count",
        "      limit",
        "      results {",
        "        id",
        "        uuid",
        "        type",
        `        ... on ${type} {`,
        `          ...minimal${type}`,
        "        }",
        "      }",
        "    }",
        "  }",
      ].join("\n"),
    );
  if (entity.documents.includes("filters"))
    documents.push(
      [
        `  query Get${type}Filters($entityType: String!) {`,
        "    EntityTypeFilters(type: $entityType) {",
        `      ... on ${type} {`,
        `        ...filtersFor${type}`,
        "      }",
        "    }",
        "  }",
      ].join("\n"),
    );
  if (entity.documents.includes("sortOptions"))
    documents.push(
      [
        `  query Get${type}SortOptions($entityType: String!) {`,
        "    EntityTypeSortOptions(entityType: $entityType) {",
        `      ... on ${type} {`,
        `        ...${low}SortOptions`,
        "      }",
        "    }",
        "  }",
      ].join("\n"),
    );
  if (entity.documents.includes("bulkOperations"))
    documents.push(
      [
        `  query Get${type}BulkOperations($entityType: String!) {`,
        "    BulkOperations(entityType: $entityType) {",
        `      ... on ${type} {`,
        `        ...${low}BulkOperations`,
        "      }",
        "    }",
        "  }",
      ].join("\n"),
    );

  for (const form of entity.createForms) documents.push(renderCreateForm(form));

  for (const custom of entity.customBulkOperations)
    documents.push(
      [
        `  query ${custom.queryName} {`,
        "    CustomBulkOperations {",
        renderBulkOperationOptions(custom.operations, 6),
        "    }",
        "  }",
      ].join("\n"),
    );

  for (const form of entity.repetitiveForms)
    documents.push(renderRepetitiveForm(form));

  for (const picker of entity.pickers) documents.push(renderPicker(picker));

  for (const source of entity.formSources) {
    const params = source.withParent
      ? "($id: String!, $parentEntityId: String)"
      : "($id: String!)";
    const args = source.withParent
      ? "(id: $id, parentEntityId: $parentEntityId)"
      : "(id: $id)";
    documents.push(
      [
        "  # Field-source document for a runtime SHACL form: the modal asks for",
        "  # it by name (loadDocument), the resolver answers with the",
        "  # shape-derived form definition.",
        `  query ${source.queryName}${params} {`,
        `    ${source.field}${args}`,
        "  }",
      ].join("\n"),
    );
  }

  return [
    "// GENERATED from src/ui/dishacled.ui.ttl — do not edit by hand.",
    "// `pnpm run generate:ui` re-renders this file; the triples are the source.",
    'import { gql } from "graphql-modules";',
    "",
    `export const ${low}Queries = gql\``,
    [...fragments, ...documents].join("\n\n"),
    "`;",
    "",
  ].join("\n");
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

const FILE_TARGETS: Record<string, string> = {
  Alert: "src/queries/entities/alert.queries.ts",
  GithubProcessor: "src/queries/entities/githubProcessor.queries.ts",
  Pipeline: "src/queries/entities/pipeline.queries.ts",
};

// entities still in region mode splice into a hand-written file; the set is
// empty now that all three types emit whole files, but the mechanism stays
// for the next entity that converts gradually
const REGION_TARGETS: Record<string, { file: string; prefix: string }> = {};

export function generate(root: string, check = false): boolean {
  const declaration = readFileSync(
    join(root, "src/ui/dishacled.ui.ttl"),
    "utf-8",
  );
  const entities = parseUiDeclaration(declaration);

  let clean = true;
  const apply = (file: string, next: string) => {
    const path = join(root, file);
    const current = readFileSync(path, "utf-8");
    if (current === next) return;
    clean = false;
    if (check) console.error(`${file} is out of date with dishacled.ui.ttl`);
    else {
      writeFileSync(path, next);
      console.log(`updated ${file}`);
    }
  };

  for (const entity of entities) {
    if (entity.emit === "file") {
      const file = FILE_TARGETS[entity.graphqlType];
      if (!file)
        throw new Error(`no file target for ${entity.graphqlType}`);
      apply(file, renderEntityFile(entity));
      continue;
    }

    const target = REGION_TARGETS[entity.graphqlType];
    if (!target) throw new Error(`no region target for ${entity.graphqlType}`);
    const path = join(root, target.file);
    let patched = readFileSync(path, "utf-8");
    patched = replaceRegion(
      patched,
      `${target.prefix}-initial-values`,
      renderInitialValues(entity, 6),
    );
    patched = replaceRegion(
      patched,
      `${target.prefix}-view-modes`,
      renderViewModes(entity, 4),
    );
    patched = replaceRegion(
      patched,
      `${target.prefix}-teaser-fields`,
      renderTeaserFields(entity, 6),
    );
    patched = replaceRegion(
      patched,
      `${target.prefix}-sort-options`,
      renderSortOptions(entity, 4),
    );
    apply(target.file, patched);
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
