import { createModule } from "graphql-modules";
import { dishacledResolver } from "./dishacledResolver";
import { dishacledSchema } from "./dishacledSchema.schema";
import { dishacledQueries } from "./queries/dishacled.queries";
import { dishacledAppConfig } from "./dishacledAppConfig";
import { dishacledFields } from "./sources/forms";
import { loadTranslationsFromDirectory } from "base-graphql";
import path from "path";
import { dishacledElodyTypeCollectionMapping } from "./sources/typeCollectionMapping";

const dishacledTranslations: Record<string, Object> =
  loadTranslationsFromDirectory(path.join(__dirname, "translations"));

const dishacledModule = createModule({
  id: "dishacledModule",
  dirname: __dirname,
  typeDefs: [dishacledSchema],
  resolvers: [dishacledResolver],
});

export {
  dishacledQueries,
  dishacledModule,
  dishacledAppConfig,
  dishacledTranslations,
  dishacledFields,
  dishacledElodyTypeCollectionMapping,
};
