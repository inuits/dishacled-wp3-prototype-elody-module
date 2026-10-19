import { ElodyInstance } from "base-graphql";
import { mediafileModule } from "mediafile-module";
import { savedSearchModule } from "saved-search-module";
import { dishacledModule, dishacledAppConfig } from "./dishacledModule";

new ElodyInstance({
  appConfig: dishacledAppConfig,
  modules: [mediafileModule, savedSearchModule, dishacledModule],
}).start();
