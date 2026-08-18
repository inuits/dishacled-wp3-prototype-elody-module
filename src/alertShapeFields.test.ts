// The alert detail view is generated from lblodsh:ErrorShape rather than
// enumerated field by field in a GraphQL fragment. collection-api derives the
// field set; this side fetches it once and merges each alert's own values onto
// it. These tests pin the merge, since a silent failure there shows up as a
// detail page of empty fields.
//
// The shape-to-fields half is tested in the collection-api
// (client-collection-module/tests/test_alert_shape.py).

import {
  fetchAlertShapeFields,
  mergeAlertValues,
  resetAlertShapeFieldsCache,
} from "./alertShapeFields";

const FIELDS = {
  message: {
    key: "message",
    label: "Message",
    __typename: "PanelMetaData",
    inputField: { type: "text", __typename: "InputField" },
  },
  created: {
    key: "created",
    label: "Created",
    __typename: "PanelMetaData",
    inputField: { type: "date", __typename: "InputField" },
  },
  detail: {
    key: "detail",
    label: "Detail",
    __typename: "PanelMetaData",
    inputField: { type: "text", __typename: "InputField" },
  },
};

const SHAPE_RESPONSE = {
  fields: FIELDS,
  order: ["message", "created", "detail"],
};

const ALERT = {
  id: "abc",
  type: "alert",
  metadata: [
    { key: "message", value: "Measurement above maximum threshold" },
    { key: "created", value: "2026-07-15T09:21:45.725000+00:00" },
  ],
};

function dataSources(response: any = SHAPE_RESPONSE, fail = false) {
  return {
    CollectionAPI: {
      getShapeFields: jest.fn(async () => {
        if (fail) throw new Error("collection-api unreachable");
        return response;
      }),
    },
  };
}

describe("mergeAlertValues", () => {
  const fields = SHAPE_RESPONSE.order.map((key) => (FIELDS as any)[key]);

  it("fills each field from the alert's own metadata", () => {
    const merged = mergeAlertValues(fields, ALERT);
    const byKey = Object.fromEntries(merged.map((f: any) => [f.key, f.value]));
    expect(byKey.message).toBe("Measurement above maximum threshold");
    expect(byKey.created).toBe("2026-07-15T09:21:45.725000+00:00");
  });

  it("keeps the field definitions intact", () => {
    // getMetadataFields in the PWA selects on __typename and renders by
    // inputField.type, so losing either turns the field invisible.
    const merged = mergeAlertValues(fields, ALERT);
    expect(merged[0].__typename).toBe("PanelMetaData");
    expect(merged[0].label).toBe("Message");
    expect(merged.find((f: any) => f.key === "created").inputField.type).toBe(
      "date",
    );
  });

  it("preserves the display order the shape endpoint returned", () => {
    const merged = mergeAlertValues(fields, ALERT);
    expect(merged.map((f: any) => f.key)).toEqual([
      "message",
      "created",
      "detail",
    ]);
  });

  it("renders an optional property the alert lacks as empty, not missing", () => {
    // The view describes the shape, so a field the shape declares stays on the
    // page even when this particular alert has no value for it.
    const merged = mergeAlertValues(fields, ALERT);
    const detail = merged.find((f: any) => f.key === "detail");
    expect(detail).toBeDefined();
    expect(detail.value).toBe("");
  });

  it("does not mutate the shared field definitions", () => {
    // The field set is cached for the process and reused for every alert; if
    // the merge wrote through, one alert's values would leak into the next.
    mergeAlertValues(fields, ALERT);
    expect((FIELDS as any).message.value).toBeUndefined();
  });

  it("survives an alert with no metadata at all", () => {
    const merged = mergeAlertValues(fields, { id: "x", type: "alert" });
    expect(merged.map((f: any) => f.value)).toEqual(["", "", ""]);
  });
});

describe("fetchAlertShapeFields", () => {
  // The field set is cached for the life of the process.
  beforeEach(() => resetAlertShapeFieldsCache());

  it("returns the fields in the order the endpoint gave", async () => {
    const sources = dataSources();
    const fields = await fetchAlertShapeFields(sources);
    expect(fields?.map((f: any) => f.key)).toEqual([
      "message",
      "created",
      "detail",
    ]);
    expect(sources.CollectionAPI.getShapeFields).toHaveBeenCalledWith("alert");
  });

  it("degrades to null when the shape cannot be fetched", async () => {
    // A missing shape must leave the rest of the page working rather than
    // failing the whole entity query.
    const fields = await fetchAlertShapeFields(dataSources(undefined, true));
    expect(fields).toBeNull();
  });
});
