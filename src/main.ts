import { mediafileModule } from "mediafile-module";
import { advancedFilterModule } from "advanced-filter-module";
import { savedSearchModule } from "saved-search-module";
import {
  dishacledModule,
  dishacledAppConfig,
  dishacledTranslations,
  dishacledFields,
  dishacledElodyTypeCollectionMapping,
  dishacledTypePillLabelMapping,
} from "./dishacledModule";
import start, { type ElodyModuleConfig } from "base-graphql";
import { dishacledPermissions } from "./dishacledPermissions";

const dishacledElodyConfig: ElodyModuleConfig = {
  modules: [
    mediafileModule,
    advancedFilterModule,
    savedSearchModule,
    dishacledModule,
  ],
  dataSources: {},
};

start(
  dishacledElodyConfig,
  dishacledAppConfig,
  dishacledTranslations,
  [],
  dishacledFields,
  dishacledElodyTypeCollectionMapping,
  dishacledPermissions,
  undefined,
  undefined,
  dishacledTypePillLabelMapping,
);
