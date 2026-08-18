// Which upstream URL a pipeline-export request maps to.
//
// Kept free of framework imports so it can be unit tested on its own, the same
// reason alertShapeFields.ts is a sibling module. The express wiring is in
// pipelineExport.ts.

// The two exports collection-api offers, and nothing else: both the id and the
// export name are interpolated into an upstream URL, so neither may be taken
// from the request unchecked.
export const PIPELINE_EXPORTS = ["export.ttl", "definition.ttl"] as const;

const SAFE_ID = /^[A-Za-z0-9._:@-]{1,255}$/;

// Only the flags collection-api actually understands are forwarded, so the
// proxy cannot be used to smuggle a query string upstream.
const FORWARDED_PARAMS = ["force", "catalog"];

export const buildUpstreamUrl = (
  collectionApiUrl: string,
  id: string,
  exportName: string,
  query: Record<string, unknown> = {},
): string | null => {
  if (!SAFE_ID.test(id)) return null;
  if (!(PIPELINE_EXPORTS as readonly string[]).includes(exportName)) return null;

  const params = new URLSearchParams();
  for (const key of FORWARDED_PARAMS) {
    const value = query[key];
    if (value !== undefined) params.set(key, String(value));
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return `${collectionApiUrl.replace(/\/$/, "")}/pipelines/${id}/${exportName}${suffix}`;
};
