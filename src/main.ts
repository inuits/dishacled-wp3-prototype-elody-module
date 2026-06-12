import { mediafileModule } from "mediafile-module";
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
    savedSearchModule,
    dishacledModule,
  ],
  dataSources: {},
};

start({
  customModuleConfig: dishacledElodyConfig,
  appConfig: dishacledAppConfig,
  customTranslations: dishacledTranslations,
  customEndpoints: [],
  customInputFields: dishacledFields,
  customTypeCollectionMapping: dishacledElodyTypeCollectionMapping,
  customPermissions: dishacledPermissions,
  customTypePillLabelMapping: dishacledTypePillLabelMapping,
});
