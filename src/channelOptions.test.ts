// A processor's config is a tree. `rdfc:RmlMapper` keeps its data input inside
// `rdfc:source` and its output inside `rdfc:defaultTarget`, so the channel
// fields that matter most are nested -- and a top-level pass left them with no
// options, which the PWA renders as a dropdown that cannot be opened.

import {
  channelOptions,
  formHasChannelField,
  injectChannelOptions,
  withChannelOptions,
} from "./channelOptions";

const CHANNELS = ["json", "rdf", "report-channel"];

// The shape collection-api actually serves for rdf-connect/rml-processor-jvm
// (`shacl/form.py` -> shui DetailsEditor), trimmed to what matters here.
const RML_FORM = {
  mappings: {
    key: "mappings",
    inputField: { type: "dropdown", channelField: true, options: [] },
  },
  baseIRI: { key: "baseIRI", inputField: { type: "text" } },
  sources: {
    key: "sources",
    inputField: {
      type: "inputFieldWithSubFields",
      isDetailsEditor: true,
      subFields: [
        {
          key: "sources.reader",
          inputField: { type: "dropdown", channelField: true, options: [] },
        },
        { key: "sources.mappingId", inputField: { type: "text" } },
        { key: "sources.triggers", inputField: { type: "checkbox" } },
      ],
    },
  },
  defaultTarget: {
    key: "defaultTarget",
    inputField: {
      type: "inputFieldWithSubFields",
      isDetailsEditor: true,
      subFields: [
        {
          key: "defaultTarget.writer",
          inputField: { type: "dropdown", channelField: true, options: [] },
        },
        { key: "defaultTarget.format", inputField: { type: "text" } },
      ],
    },
  },
};

const optionsOf = (form: any, path: string[]): any[] => {
  let inputField = form[path[0]].inputField;
  for (const key of path.slice(1)) {
    inputField = inputField.subFields.find((s: any) => s.key === key)
      .inputField;
  }
  return inputField.options || [];
};

describe("injectChannelOptions", () => {
  it("fills a top-level channel field", () => {
    const filled = injectChannelOptions(RML_FORM, CHANNELS);
    expect(optionsOf(filled, ["mappings"]).map((o: any) => o.value)).toEqual(
      CHANNELS,
    );
  });

  it("fills a channel field nested in a details editor", () => {
    const filled = injectChannelOptions(RML_FORM, CHANNELS);
    expect(
      optionsOf(filled, ["sources", "sources.reader"]).map((o: any) => o.value),
    ).toEqual(CHANNELS);
    expect(
      optionsOf(filled, ["defaultTarget", "defaultTarget.writer"]).map(
        (o: any) => o.value,
      ),
    ).toEqual(CHANNELS);
  });

  it("leaves fields that are not channels alone", () => {
    const filled = injectChannelOptions(RML_FORM, CHANNELS);
    expect(filled.baseIRI.inputField.options).toBeUndefined();
    expect(
      optionsOf(filled, ["sources", "sources.mappingId"]),
    ).toEqual([]);
  });

  it("keeps the nested structure and its other keys", () => {
    const filled = injectChannelOptions(RML_FORM, CHANNELS);
    expect(filled.sources.inputField.isDetailsEditor).toBe(true);
    expect(
      filled.sources.inputField.subFields.map((s: any) => s.key),
    ).toEqual(["sources.reader", "sources.mappingId", "sources.triggers"]);
  });

  it("does not mutate the form it was given", () => {
    injectChannelOptions(RML_FORM, CHANNELS);
    expect(RML_FORM.mappings.inputField.options).toEqual([]);
    expect(RML_FORM.sources.inputField.subFields[0].inputField.options).toEqual(
      [],
    );
  });

  it("survives an empty or absent form", () => {
    expect(injectChannelOptions(undefined, CHANNELS)).toBeUndefined();
    expect(injectChannelOptions({}, CHANNELS)).toEqual({});
  });

  it("an empty channel list leaves an empty option list", () => {
    const filled = injectChannelOptions(RML_FORM, []);
    expect(optionsOf(filled, ["sources", "sources.reader"])).toEqual([]);
  });
});

describe("withChannelOptions", () => {
  it("recurses to any depth", () => {
    const deep = {
      type: "inputFieldWithSubFields",
      subFields: [
        {
          key: "a",
          inputField: {
            type: "inputFieldWithSubFields",
            subFields: [
              {
                key: "a.b",
                inputField: { type: "dropdown", channelField: true },
              },
            ],
          },
        },
      ],
    };
    const filled = withChannelOptions(deep, CHANNELS);
    expect(
      filled.subFields[0].inputField.subFields[0].inputField.options,
    ).toHaveLength(CHANNELS.length);
  });
});

describe("formHasChannelField", () => {
  it("is true for a top-level channel field", () => {
    expect(formHasChannelField({ a: { inputField: { channelField: true } } })).toBe(
      true,
    );
  });

  it("is true when only a nested field is a channel", () => {
    // this is the case the flat property list gets wrong: no channel field at
    // the top, so the options were never fetched and every nested dropdown came
    // out empty
    expect(
      formHasChannelField({
        config: {
          inputField: {
            type: "inputFieldWithSubFields",
            subFields: [
              { key: "config.writer", inputField: { channelField: true } },
            ],
          },
        },
      }),
    ).toBe(true);
  });

  it("is false when nothing is a channel", () => {
    expect(
      formHasChannelField({ a: { inputField: { type: "text" } } }),
    ).toBe(false);
  });

  it("is false for an absent form", () => {
    expect(formHasChannelField(undefined)).toBe(false);
  });
});

// The channel list is one list, and a page of processors is one request.
//
// `processorConfig` is in the picker's own fragment, so it resolves once per
// row -- and each row fetched the whole channel collection for itself. A page
// of fifty processors was fifty identical POSTs to collection-api before the
// modal could open. The list cannot be cached across requests (channels are
// created while the app is running) but within one request it is one answer.
describe("channelOptions", () => {
  const dataSourcesSpy = () => {
    const calls: any[] = [];
    return {
      calls,
      dataSources: {
        CollectionAPI: {
          GetAdvancedEntities: async (...args: any[]) => {
            calls.push(args);
            return {
              results: [
                { metadata: [{ key: "name", value: "json" }] },
                { metadata: [{ key: "name", value: "report" }] },
              ],
            };
          },
        },
      },
    };
  };

  it("asks collection-api once however many rows need the list", async () => {
    const { calls, dataSources } = dataSourcesSpy();

    const [first, second, third] = await Promise.all([
      channelOptions(dataSources),
      channelOptions(dataSources),
      channelOptions(dataSources),
    ]);

    expect(calls.length).toBe(1);
    expect(first).toEqual(["json", "report"]);
    expect(second).toEqual(first);
    expect(third).toEqual(first);
  });

  it("asks again for the next request", async () => {
    // a channel created between two requests has to show up in the second
    const first = dataSourcesSpy();
    const second = dataSourcesSpy();

    await channelOptions(first.dataSources);
    await channelOptions(second.dataSources);

    expect(first.calls.length).toBe(1);
    expect(second.calls.length).toBe(1);
  });

  it("does not retry a failing collection-api once per row", async () => {
    let attempts = 0;
    const dataSources: any = {
      CollectionAPI: {
        GetAdvancedEntities: async () => {
          attempts += 1;
          throw new Error("collection-api is down");
        },
      },
    };

    const answers = await Promise.all([
      channelOptions(dataSources),
      channelOptions(dataSources),
    ]);

    expect(attempts).toBe(1);
    // every row gets the same empty list rather than its own failure
    expect(answers).toEqual([[], []]);
  });
});
