// Downloading a pipeline's Turtle export from the browser.
//
// collection-api serves both exports already, but the browser cannot call it:
// the access token lives in this service's session, not in the page. So this
// proxies them, adding the token and passing the upstream status, content type
// and filename straight through.
//
// Surfaced as Export actions on the pipeline detail page -- see
// `entityPageConfig` in dishacledRoutes.ts.

import type { Express, Request, Response } from "express";
import { getCurrentEnvironment, fetchWithTokenRefresh } from "base-graphql";
import { buildUpstreamUrl } from "./pipelineExportUrl";

export const applyPipelineExportEndpoint = (app: Express) => {
  app.get(
    "/api/pipelines/:id/:exportName",
    async (request: Request, response: Response) => {
      const { id, exportName } = request.params;
      const url = buildUpstreamUrl(
        getCurrentEnvironment().api.collectionApiUrl,
        id,
        exportName,
        request.query as Record<string, unknown>,
      );
      if (!url) {
        response.status(404).json({ message: "Unknown pipeline export" });
        return;
      }

      try {
        const upstream = await fetchWithTokenRefresh(
          url,
          { method: "GET" },
          request,
        );
        const body = await upstream.text();

        // A pipeline whose shapes do not line up comes back as 409 with a JSON
        // explanation. Pass status and body through rather than flattening
        // them, so the reason stays visible in the response.
        response.setHeader(
          "Content-Type",
          upstream.headers.get("Content-Type") || "text/turtle",
        );
        const disposition = upstream.headers.get("Content-Disposition");
        if (disposition) response.setHeader("Content-Disposition", disposition);
        response.status(upstream.status).send(body);
      } catch (exception: any) {
        console.error("[pipelineExport] failed:", exception);
        response
          .status(502)
          .json({ message: "Could not reach the collection API" });
      }
    },
  );
};
