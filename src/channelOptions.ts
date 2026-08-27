// Live channel options, injected into the SHACL-derived config form.
//
// collection-api marks every `rdfc:Reader` / `rdfc:Writer` / `rdfc:Channel`
// property as a channel field (`shacl/form.py`) but cannot fill in the options:
// the channels are Elody entities, so only the graphql service knows them. It
// therefore ships the fields with `options: []` and they are filled in here.
//
// A processor's config is a tree, not a list. `rdfc:RmlMapper` keeps its data
// input inside `rdfc:source` and its output inside `rdfc:defaultTarget`, which
// arrive as nested `inputFieldWithSubFields` blocks -- so the channel fields
// that matter most are the ones a top-level pass never reaches. Filling only
// the top level left those dropdowns with no options at all, which renders as a
// dropdown that cannot be opened.

export type DropdownOption = {
  icon: string;
  label: string;
  value: string;
  __typename: "DropdownOption";
};

const asOptions = (channels: string[]): DropdownOption[] =>
  channels.map((channel) => ({
    icon: "NoIcon",
    label: channel,
    value: channel,
    __typename: "DropdownOption",
  }));

// One input field, and every field nested inside it.
export function withChannelOptions(inputField: any, channels: string[]): any {
  if (!inputField) return inputField;

  let next = inputField;
  if (inputField.channelField) {
    next = { ...next, options: asOptions(channels) };
  }
  if (Array.isArray(inputField.subFields)) {
    next = {
      ...next,
      subFields: inputField.subFields.map((subField: any) => ({
        ...subField,
        inputField: withChannelOptions(subField.inputField, channels),
      })),
    };
  }
  return next;
}

export function injectChannelOptions(formFields: any, channels: string[]): any {
  if (!formFields) return formFields;

  const result: any = {};
  for (const [key, field] of Object.entries<any>(formFields)) {
    result[key] = field?.inputField
      ? { ...field, inputField: withChannelOptions(field.inputField, channels) }
      : field;
  }
  return result;
}

// Whether anything in this form needs the channel list at all.
//
// Asked of the form tree rather than of the flat property list, because a
// processor's channel fields may live only inside a nested block -- and then a
// top-level answer is "no", the options are never fetched, and the nested
// dropdowns come out empty however carefully they are filled in afterwards.
export function formHasChannelField(formFields: any): boolean {
  if (!formFields) return false;
  return Object.values<any>(formFields).some((field) =>
    inputHasChannelField(field?.inputField),
  );
}

function inputHasChannelField(inputField: any): boolean {
  if (!inputField) return false;
  if (inputField.channelField) return true;
  return (inputField.subFields || []).some((subField: any) =>
    inputHasChannelField(subField?.inputField),
  );
}


// The channel list, fetched at most once per GraphQL request.
//
// `processorConfig` is a field of every row in the picker's fragment, so it
// resolves once per processor -- and each resolution fetched the whole channel
// collection for itself. Opening "Add processor" on a page of fifty components
// was fifty identical POSTs to collection-api, in series with the render.
//
// Keyed on the request's `dataSources`, which Apollo builds fresh per request
// (`baseGraphql/main.ts`): that scopes the answer to exactly one request, so a
// channel created between two of them still shows up in the second. The
// *promise* is what is remembered, not the result, so rows that ask
// concurrently share the one in-flight call rather than each starting another.
//
// A failed fetch is remembered along with a successful one. It answers `[]`,
// which is what the row gets either way, and re-asking a collection-api that
// just failed once per row is fifty more failures, not a better answer.
const inFlight = new WeakMap<object, Promise<string[]>>();

export function channelOptions(dataSources: any): Promise<string[]> {
  let pending = inFlight.get(dataSources);
  if (!pending) {
    pending = fetchChannelOptions(dataSources);
    inFlight.set(dataSources, pending);
  }
  return pending;
}

async function fetchChannelOptions(dataSources: any): Promise<string[]> {
  try {
    const result = await dataSources.CollectionAPI.GetAdvancedEntities(
      "channel" as any,
      100,
      1, // 1-based page; skip is derived as limit * (page - 1)
      [
        {
          type: "selection",
          key: "type",
          value: ["channel"],
          match_exact: true,
        },
      ],
      { value: "", isAsc: undefined, key: "", order_by: "" },
    );
    return (
      result?.results?.map((channel: any) => {
        const meta = channel.metadata || channel.data?.metadata;
        if (Array.isArray(meta)) {
          return (
            meta.find((entry: any) => entry.key === "name")?.value ||
            channel.identifiers?.[0] ||
            ""
          );
        }
        return meta?.name?.value || channel.identifiers?.[0] || "";
      }) ?? []
    );
  } catch (e) {
    console.error("[channelOptions] Failed:", e);
    return [];
  }
}
