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
import { ElodyInstance, type ElodyModuleConfig } from "base-graphql";
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

new ElodyInstance({
  customModuleConfig: dishacledElodyConfig,
  appConfig: dishacledAppConfig,
  customTranslations: dishacledTranslations,
  customEndpoints: [],
  customInputFields: dishacledFields,
  customTypeCollectionMapping: dishacledElodyTypeCollectionMapping,
  customPermissions: dishacledPermissions,
  customTypePillLabelMapping: dishacledTypePillLabelMapping,
}).start();
