import { createModule } from "graphql-modules";
import { dishacledResolver } from "./dishacledResolver";
import { dishacledSchema } from "./dishacledSchema.schema";
import { dishacledQueries } from "./queries/dishacled.queries";
import { dishacledAppConfig } from "./dishacledAppConfig";
import { dishacledFields } from "./sources/forms";
import { defineElodyModule, loadTranslationsFromDirectory } from "base-graphql";
import path from "path";
import { dishacledElodyTypeCollectionMapping } from "./sources/typeCollectionMapping";
import { dishacledTypePillLabelMapping } from "./sources/typePillLabelMapping";
import { dishacledPermissions } from "./dishacledPermissions";

const dishacledTranslations: Record<string, Object> =
  loadTranslationsFromDirectory(path.join(__dirname, "translations"));

const dishacledModule = defineElodyModule({
  name: "dishacledModule",
  graphqlModule: createModule({
    id: "dishacledModule",
    dirname: __dirname,
    typeDefs: [dishacledSchema],
    resolvers: [dishacledResolver],
  }),
  translations: dishacledTranslations,
  inputFields: dishacledFields,
  typeCollectionMapping: dishacledElodyTypeCollectionMapping,
  permissions: dishacledPermissions,
  typePillLabelMapping: dishacledTypePillLabelMapping,
});

export {
  dishacledQueries,
  dishacledModule,
  dishacledAppConfig,
  dishacledTranslations,
  dishacledFields,
  dishacledElodyTypeCollectionMapping,
  dishacledTypePillLabelMapping,
};
