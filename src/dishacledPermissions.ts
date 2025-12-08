// @ts-ignore
import {
  Entitytyping,
  PermissionRequestInfo,
} from "../generated-types/type-defs";

export const dishacledPermissions: { [key: string]: PermissionRequestInfo } = {
  "create:pipeline": {
    datasource: "CollectionAPI",
    crud: "post",
    uri: `/entities`,
    body: { type: Entitytyping.Pipeline },
  },
  "create:channel": {
    datasource: "CollectionAPI",
    crud: "post",
    uri: `/entities`,
    body: { type: Entitytyping.Channel },
  },
  "create:processor": {
    datasource: "CollectionAPI",
    crud: "post",
    uri: `/entities`,
    body: { type: Entitytyping.Processor },
  },
  "create:runner": {
    datasource: "CollectionAPI",
    crud: "post",
    uri: `/entities`,
    body: { type: Entitytyping.Runner },
  },
  "update:pipeline:has-runner": {
    datasource: "CollectionAPI",
    crud: "patch",
    uri: "/entities/$parentEntityId",
    body: {
      relations: [{ key: "", type: "hasRunner" }],
      type: Entitytyping.Pipeline,
    },
  },
  "update:jvmRmlProcessor:has-runner": {
    datasource: "CollectionAPI",
    crud: "patch",
    uri: "/entities/$parentEntityId",
    body: {
      relations: [{ key: "", type: "hasRunner" }],
      type: Entitytyping.JvmRmlProcessor,
    },
  },
  "update:pyLogProcessor:has-runner": {
    datasource: "CollectionAPI",
    crud: "patch",
    uri: "/entities/$parentEntityId",
    body: {
      relations: [{ key: "", type: "hasRunner" }],
      type: Entitytyping.PyLogProcessor,
    },
  },
  "update:tsHttpUtilsProcessor:has-runner": {
    datasource: "CollectionAPI",
    crud: "patch",
    uri: "/entities/$parentEntityId",
    body: {
      relations: [{ key: "", type: "hasRunner" }],
      type: Entitytyping.TsHttpUtilsProcessor,
    },
  },
  "update:runner:has-processor": {
    datasource: "CollectionAPI",
    crud: "patch",
    uri: "/entities/$parentEntityId",
    body: {
      relations: [{ key: "", type: "hasProcessor" }],
      type: Entitytyping.Runner,
    },
  },
    "update:jsrunner:has-processor": {
    datasource: "CollectionAPI",
    crud: "patch",
    uri: "/entities/$parentEntityId",
    body: {
      relations: [{ key: "", type: "hasProcessor" }],
      type: Entitytyping.JsRunner,
    },
  },
    "update:jvmrunner:has-processor": {
    datasource: "CollectionAPI",
    crud: "patch",
    uri: "/entities/$parentEntityId",
    body: {
      relations: [{ key: "", type: "hasProcessor" }],
      type: Entitytyping.JvmRunner,
    },
  },
    "update:pyrunner:has-processor": {
    datasource: "CollectionAPI",
    crud: "patch",
    uri: "/entities/$parentEntityId",
    body: {
      relations: [{ key: "", type: "hasProcessor" }],
      type: Entitytyping.PyRunner,
    },
  },
  "update:pipeline:has-processor": {
    datasource: "CollectionAPI",
    crud: "patch",
    uri: "/entities/$parentEntityId",
    body: {
      relations: [{ key: "", type: "hasProcessor" }],
      type: Entitytyping.Pipeline,
    },
  },
};
