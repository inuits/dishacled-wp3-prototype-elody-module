// The alert detail view, generated from lblodsh:ErrorShape.
//
// collection-api derives the field set from the shape through the same
// shacl_to_form_fields pipeline that produces processor config forms and serves
// it at /shapes/alert. Here it is fetched once and each alert's own values are
// merged onto it, so the GraphQL fragment declares a panel rather than seven
// fields: add a property to the shape and it appears with no query change.
//
// A sibling module rather than resolver internals, following
// pipelineConnections.ts, so it can be unit tested on its own.

// The shape is read from the contract catalog at startup and only changes with
// a restart, so it is fetched once per process.
let alertShapeFieldsCache: any[] | null = null;

/** Test seam: the cache is process-wide by design. */
export function resetAlertShapeFieldsCache(): void {
  alertShapeFieldsCache = null;
}

export async function fetchAlertShapeFields(
  dataSources: any,
): Promise<any[] | null> {
  if (alertShapeFieldsCache) return alertShapeFieldsCache;
  try {
    const shape = await dataSources.CollectionAPI.getShapeFields("alert");
    const fields = shape?.fields;
    if (!fields) return null;
    // The endpoint returns the fields already in display order; keep it.
    const order: string[] = shape.order ?? Object.keys(fields);
    alertShapeFieldsCache = order
      .filter((key) => fields[key])
      .map((key) => fields[key]);
    return alertShapeFieldsCache;
  } catch (e) {
    console.error("[fetchAlertShapeFields] Failed:", e);
    return null;
  }
}

/**
 * Merge one alert's stored values onto the shape-derived field definitions.
 *
 * getMetadataFields in the PWA prefers a value already present on a field over
 * the form store, which is what lets the panel render without the fragment
 * declaring intialValues for every key.
 */
export function mergeAlertValues(fields: any[], entity: any): any[] {
  const values: Record<string, any> = {};
  for (const item of entity?.metadata ?? []) {
    if (item?.key !== undefined) values[item.key] = item.value;
  }
  // Copies, never in place: the field definitions are cached and shared by
  // every alert, so writing through would leak one alert's values into the next.
  return fields.map((field) => ({
    ...field,
    // An optional property the shape declares but this alert does not carry
    // still appears, empty -- the view describes the shape, not one instance.
    value: values[field.key] ?? "",
  }));
}

/** The `shapeFields` resolver for an alert. */
export async function resolveAlertShapeFields(
  parent: any,
  dataSources: any,
): Promise<any[] | null> {
  const fields = await fetchAlertShapeFields(dataSources);
  if (!fields) return null;
  return mergeAlertValues(fields, parent);
}
