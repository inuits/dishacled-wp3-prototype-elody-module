import { mediafileModule } from "mediafile-module";
import { advancedFilterModule } from "advanced-filter-module";
import { savedSearchModule } from "saved-search-module";
import {
  dishacledModule,
  dishacledAppConfig,
  dishacledTranslations,
  dishacledFields,
  dishacledElodyTypeCollectionMapping,
} from "./dishacledModule";
import start, { type ElodyModuleConfig } from "base-graphql";

const dishacledElodyConfig: ElodyModuleConfig = {
  modules: [
    mediafileModule,
    advancedFilterModule,
    savedSearchModule,
    dishacledModule,
  ],
};

start(
  dishacledElodyConfig,
  dishacledAppConfig,
  dishacledTranslations,
  [],
  dishacledFields,
  dishacledElodyTypeCollectionMapping,
);
