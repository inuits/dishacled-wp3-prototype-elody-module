import { createModule } from "graphql-modules";
import { dishacledResolver } from "./dishacledResolver";
import { dishacledSchema } from "./dishacledSchema.schema";
import { dishacledQueries } from "./queries/dishacled.queries";
import { dishacledAppConfig } from "./dishacledAppConfig";
import { dishacledFields } from "./sources/forms";
import { loadTranslations, baseTranslations } from "base-graphql";
import path from "path";
import { mergeObjects } from "json-merger";
import { dishacledElodyTypeCollectionMapping } from "./sources/typeCollectionMapping";

const translations: Record<string, Object> = {
  en: loadTranslations(path.join(__dirname, "./translations/en.json")),
  nl: loadTranslations(path.join(__dirname, "./translations/nl.json")),
};

const dishacledModule = createModule({
  id: "dishacledModule",
  dirname: __dirname,
  typeDefs: [dishacledSchema],
  resolvers: [dishacledResolver],
});

const dishacledTranslations = Object.values(translations);

const appTranslations = mergeObjects([
  baseTranslations,
  ...dishacledTranslations,
]);

export {
  dishacledQueries,
  dishacledModule,
  dishacledAppConfig,
  appTranslations,
  dishacledFields,
  dishacledElodyTypeCollectionMapping,
};
