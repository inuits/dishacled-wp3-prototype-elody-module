import { mediafileModule } from "mediafile-module";
import { advancedFilterModule } from "advanced-filter-module";
import { savedSearchModule } from "saved-search-module";
import {
  dishacledModule,
  dishacledAppConfig,
  appTranslations,
  dishacledFields,
  dishacledElodyTypeCollectionMapping,
} from "./dishacledModule";
import start, { type ElodyConfig, generateElodyConfig } from "base-graphql";

const dishacledElodyConfig: ElodyConfig = generateElodyConfig([
  mediafileModule,
  advancedFilterModule,
  savedSearchModule,
  dishacledModule,
]);

start(
  dishacledElodyConfig,
  dishacledAppConfig,
  appTranslations,
  [],
  dishacledFields,
  dishacledElodyTypeCollectionMapping,
);
