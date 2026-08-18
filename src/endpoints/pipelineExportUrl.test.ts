// The browser cannot call collection-api directly (the token lives in this
// service's session), so pipeline exports are proxied. The interesting part is
// the URL it builds: both the pipeline id and the export name are interpolated
// into an upstream URL, so both are checked rather than trusted.

import { buildUpstreamUrl } from "./pipelineExportUrl";

const API = "http://collection-api:5000/";
const ID = "8f14e45f-ceea-467a-9fbd-0a1e2c3d4e5f";

describe("buildUpstreamUrl", () => {
  it("builds the runnable pipeline export", () => {
    expect(buildUpstreamUrl(API, ID, "export.ttl")).toBe(
      `http://collection-api:5000/pipelines/${ID}/export.ttl`,
    );
  });

  it("builds the toolchain definition export", () => {
    expect(buildUpstreamUrl(API, ID, "definition.ttl")).toBe(
      `http://collection-api:5000/pipelines/${ID}/definition.ttl`,
    );
  });

  it("forwards only the flags collection-api understands", () => {
    const url = buildUpstreamUrl(API, ID, "definition.ttl", {
      catalog: "false",
      force: "true",
      // Anything else would let the proxy smuggle a query string upstream.
      redirect: "http://evil.example",
    });
    expect(url).toContain("catalog=false");
    expect(url).toContain("force=true");
    expect(url).not.toContain("evil");
  });

  it("omits the query string entirely when no flag was given", () => {
    expect(buildUpstreamUrl(API, ID, "export.ttl")).not.toContain("?");
  });

  it("refuses an unknown export name", () => {
    // Otherwise the path segment is a free hand into the collection API.
    expect(buildUpstreamUrl(API, ID, "../../users")).toBeNull();
    expect(buildUpstreamUrl(API, ID, "anything.ttl")).toBeNull();
  });

  it.each([
    "../../secret",
    "id with spaces",
    "id/../..",
    "id?x=1",
    "",
  ])("refuses the unsafe pipeline id %p", (id) => {
    expect(buildUpstreamUrl(API, id, "export.ttl")).toBeNull();
  });

  it("does not double the slash when the configured url has none", () => {
    expect(buildUpstreamUrl("http://collection-api:5000", ID, "export.ttl")).toBe(
      `http://collection-api:5000/pipelines/${ID}/export.ttl`,
    );
  });
});
