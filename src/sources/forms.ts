import {
  AdvancedFilterTypes,
  InputField,
  InputFieldTypes,
} from "../../generated-types/type-defs";

export const dishacledFields: { [key: string]: InputField } = {
hasWriterField: {
    type: InputFieldTypes.DropdownSingleselectRelations,
    relationType: "hasWriter",
    canCreateEntityFromOption: true,
    metadataKeyToCreateEntityFromOption: "name",
    entityType: "channel",
    isMetadataField: true,
    advancedFilterInputForRetrievingOptions: [
      {
        type: AdvancedFilterTypes.Text,
        key: ["elody:1|metadata.name.value"],
        value: "*",
        match_exact: false,
      },
      {
        type: AdvancedFilterTypes.Type,
        value: "channel",
      }
    ],
     relationFilter: {
      type: AdvancedFilterTypes.Selection,
      key: ["elody:1|identifiers"],
      value: "$relationValues.hasWriter.key",
      match_exact: true,
      item_types: ["channel"],
    },

  },
};
