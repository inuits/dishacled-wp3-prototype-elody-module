import { gql } from "graphql-modules";

export const dishacledQueries = gql`
  fragment minimalLinkedMedia on Media {
    ...minimalBaseEntity
    intialValues {
      title: keyValue(key: "title", source: metadata)
    }
    allowedViewModes {
      viewModes(input: [
        { viewMode: ViewModesList }
        { viewMode: ViewModesGrid }
      ]) {
        ...viewModes
      }
    }
    teaserMetadata {
      title: metaData {
        label(input: "metadata.labels.title")
        key(input: "title")
      }
    }
  }

  fragment typePillsIntialValues on IntialValues {
    type: keyValue(key: "type", source: typePillLabel, index: 0, formatter: "pill|auto")
  }

  fragment typePillsTeaserMetadata on teaserMetadata {
    type: metaData {
      label(input: "metadata.labels.type")
      key(input: "type")
    }
  }

  fragment fullEntity on Entity {
    id
    uuid
    type
    ... on User {
      ...fullUser
    }
    ... on Tenant {
      ...fullTenant
    }
    ... on Pipeline {
      ...fullPipeline
    }
    ... on Runner {
      ...fullRunner
    }
    ... on JsRunner {
      ...fullJsRunner
    }
    ... on JvmRunner {
      ...fullJvmRunner
    }
    ... on PyRunner {
      ...fullPyRunner
    }
    ... on Processor {
      ...fullProcessor
    }
    ... on JvmRmlProcessor {
      ...fullJvmRmlProcessor
    }
    ... on PyLogProcessor {
      ...fullPyLogProcessor
    }
    ... on TsHttpUtilsProcessor {
      ...fullTsHttpUtilsProcessor
    }
    ... on Channel {
      ...fullChannel
    }
  }

  query getEntities(
    $type: Entitytyping!
    $limit: Int
    $skip: Int
    $searchValue: SearchFilter!
    $advancedSearchValue: [FilterInput]
    $advancedFilterInputs: [AdvancedFilterInput!]!
    $searchInputType: SearchInputType
  ) {
    Entities(
      type: $type
      limit: $limit
      skip: $skip
      searchValue: $searchValue
      advancedSearchValue: $advancedSearchValue
      advancedFilterInputs: $advancedFilterInputs
      searchInputType: $searchInputType
    ) {
      count
      limit
      results {
        id
        uuid
        type
        ... on User {
          ...minimalUser
        }
        ... on Tenant {
          ...minimalTenant
        }
        ... on Pipeline {
          ...minimalPipeline
        }
        ... on Runner {
          ...minimalRunner
        }
        ... on JsRunner {
          ...minimalJsRunner
        }
        ... on JvmRunner {
          ...minimalJvmRunner
        }
        ... on PyRunner {
          ...minimalPyRunner
        }
        ... on Processor {
          ...minimalProcessor
        }
        ... on JvmRmlProcessor {
          ...minimalJvmRmlProcessor
        }
        ... on PyLogProcessor {
          ...minimalPyLogProcessor
        }
        ... on TsHttpUtilsProcessor {
          ...minimalTsHttpUtilsProcessor
        }
        ... on Channel {
          ...minimalChannel
        }
      }
    }
  }

  query getTenants {
    Tenants {
      count
      limit
      results {
        id
        uuid
        type
        ... on Tenant {
          ...minimalTenant
        }
      }
    }
  }

  query getEntityById($id: String!, $type: String!) {
    Entity(id: $id, type: $type) {
      ...fullEntity
    }
  }

  query getDirectories($dir: String) {
    Directories(dir: $dir) {
      id
      dir
      has_subdirs
      parent
    }
  }

  query getAdvancedFilters($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      ... on User {
        ...filtersForUser
      }
      ... on Tenant {
        ...tenantFilters
      }
      ... on Pipeline {
        ...filtersForPipeline
      }
      ... on Runner {
        ...filtersForRunner
      }
      ... on JsRunner {
        ...filtersForJsRunner
      }
      ... on JvmRunner {
        ...filtersForJvmRunner
      }
      ... on PyRunner {
        ...filtersForPyRunner
      }
      ... on Processor {
        ...filtersForProcessor
      }
      ... on JvmRmlProcessor {
        ...filtersForJvmRmlProcessor
      }
      ... on PyLogProcessor {
        ...filtersForPyLogProcessor
      }
      ... on TsHttpUtilsProcessor {
        ...filtersForTsHttpUtilsProcessor
      }
      ... on Channel {
        ...filtersForChannel
      }
    }
  }

  query getFilterOptions(
    $input: [AdvancedFilterInput!]!
    $limit: Int!
    $entityType: String!
  ) {
    FilterOptions(input: $input, limit: $limit, entityType: $entityType) {
      label
      value
    }
  }

  query getUserPermissions {
    UserPermissions {
      payload
    }
  }

  mutation postStartImport($folder: String!) {
    postStartImport(folder: $folder) {
      message_id
      status
      count
    }
  }

  mutation linkMediafileToEntity(
    $entityId: String!
    $mediaFileInput: MediaFileInput!
  ) {
    linkMediafileToEntity(
      entityId: $entityId
      mediaFileInput: $mediaFileInput
    ) {
      _id
      filename
      original_file_location
      thumbnail_file_location
      mimetype
      metadata {
        key
        value
      }
    }
  }

  mutation patchMediaFileMetadata(
    $mediafileId: String!
    $mediaFileInput: [MediaFileMetadataInput]!
  ) {
    patchMediaFileMetadata(
      MediafileId: $mediafileId
      MediaFileMetadata: $mediaFileInput
    ) {
      _id
      filename
    }
  }

  mutation getMediaRelationedWithMediafFile($mediaFileId: String!) {
    getMediaRelationedWithMediafFile(mediaFileId: $mediaFileId) {
      ...minimalLinkedMedia
    }
  }

  mutation mutateEntityValues(
    $id: String!
    $formInput: EntityFormInput!
    $collection: Collection!
  ) {
    mutateEntityValues(
      id: $id
      formInput: $formInput
      collection: $collection
    ) {
      ...fullEntity
    }
  }

  mutation deleteData(
    $id: String!
    $path: Collection!
    $deleteMediafiles: Boolean!
  ) {
    deleteData(id: $id, path: $path, deleteMediafiles: $deleteMediafiles)
  }

  mutation bulkDeleteEntities(
    $ids: [String!]!
    $path: Collection!
    $deleteEntities: DeleteEntitiesInput
  ) {
    bulkDeleteEntities(ids: $ids, path: $path, deleteEntities: $deleteEntities)
  }

  mutation CreateEntity($entity: EntityInput!) {
    CreateEntity(entity: $entity) {
      ...fullEntity
    }
  }

  mutation BulkAddRelations(
    $entityIds: [String!]!
    $relationEntityId: String!
    $relationType: String!
  ) {
    bulkAddRelations(
      entityIds: $entityIds
      relationEntityId: $relationEntityId
      relationType: $relationType
    )
  }

  query GetBulkOperationsRelationForm {
    BulkOperationsRelationForm {
      label(input: "bulk-operations.bulk-edit.bulk-edit-title")
      relations: panels {
        ... on WindowElementPanel {
          label(input: "bulk-operations.bulk-edit.relation-types")
          panelType(input: metadata)
          isEditable(input: true)
          isCollapsed(input: false)
        }
      }
    }
  }

  query GetMenu($name: String!) {
    Menu(name: $name) {
      menu {
        name
        pipelines: menuItem(
          label: "navigation.pipelines"
          entityType: pipeline
          typeLink: { route: { destination: "pipelines" } }
          icon: CloudDataConnection
          requiresAuth: true
        ) {
          label
          entityType
          typeLink {
            route {
              destination
            }
          }
          icon
          requiresAuth
        }
        runners: menuItem(
          label: "navigation.runners"
          entityType: runner
          typeLink: { route: { destination: "runners" } }
          icon: Cog
          requiresAuth: true
        ) {
          label
          entityType
          typeLink {
            route {
              destination
            }
          }
          icon
          requiresAuth
        }
        processors: menuItem(
          label: "navigation.processors"
          entityType: processor
          typeLink: { route: { destination: "processors" } }
          icon: Processor
          requiresAuth: true
        ) {
          label
          entityType
          typeLink {
            route {
              destination
            }
          }
          icon
          requiresAuth
        }
        channels: menuItem(
          label: "navigation.channels"
          entityType: channel
          typeLink: { route: { destination: "channels" } }
          icon: Channel
          requiresAuth: true
        ) {
          label
          entityType
          typeLink {
            route {
              destination
            }
          }
          icon
          requiresAuth
        }
      }
    }
  }

  query GetDropzoneEntityToCreate {
    DropzoneEntityToCreate {
      options(
        input: [{ icon: NoIcon, label: "navigation.media", value: "media" }]
      ) {
        icon
        label
        value
      }
    }
  }

  query GetSortOptions($entityType: String!) {
    EntityTypeSortOptions(entityType: $entityType) {
      ... on BaseEntity {
        sortOptions {
          options(
            input: [
              { icon: NoIcon, label: "metadata.labels.title", value: "title" }
            ]
          ) {
            icon
            label
            value
          }
        }
      }
      ... on User {
        ...userSortOptions
      }
      ... on Tenant {
        ...tenantSortOptions
      }
      ... on Pipeline {
        ...pipelineSortOptions
      }
      ... on Runner {
        ...runnerSortOptions
      }
      ... on JsRunner {
        ...jsRunnerSortOptions
      }
      ... on JvmRunner {
        ...jvmRunnerSortOptions
      }
      ... on PyRunner {
        ...pyRunnerSortOptions
      }
      ... on Processor {
        ...processorSortOptions
      }
      ... on Channel {
        ...channelSortOptions
      }
    }
  }

  query GetPaginationLimitOptions {
    PaginationLimitOptions {
      options(
        input: [
          { icon: ListOl, label: "20", value: 20 }
          { icon: ListOl, label: "50", value: 50 }
          { icon: ListOl, label: "100", value: 100 }
        ]
      ) {
        icon
        label
        value
      }
    }
  }

  query GetBulkOperations($entityType: String!) {
    BulkOperations(entityType: $entityType) {
      ... on BaseEntity {
        bulkOperationOptions {
          options(
            input: [
              #              { icon: Edit, label: "bulk-operations.edit", value: "edit" }
            ]
          ) {
            icon
            label
            value
          }
        }
      }
      ... on Pipeline {
        ...pipelineBulkOperations
      }
      ... on Processor {
        ...processorBulkOperations
      }
      ... on JvmRmlProcessor {
        ...jvmRmlProcessorBulkOperations
      }
      ... on PyLogProcessor {
        ...pyLogProcessorBulkOperations
      }
      ... on TsHttpUtilsProcessor {
        ...tsHttpUtilsProcessorBulkOperations
      }
      ... on JsRunner {
        ...jsRunnerBulkOperations
      }
      ... on JvmRunner {
        ...jvmRunnerBulkOperations
      }
      ... on PyRunner {
        ...pyRunnerBulkOperations
      }
    }
  }

  query GetEntityPickerForm {
    GetDynamicForm {
      import: formTab {
        formFields {
          entityPicker: metaData {
            label(input: "metadata.labels.entity-picker")
            key(input: "entityPicker")
            inputField(type: baseEntityPickerField) {
              ...inputfield
            }
          }
        }
      }
    }
  }

  query GetEntityPickerFormWithUploadTab {
    GetDynamicForm {
      import: formTab {
        formFields {
          entityPicker: metaData {
            label(input: "metadata.labels.entity-picker")
            key(input: "entityPicker")
            inputField(type: baseEntityPickerField) {
              ...inputfield
            }
          }
        }
      }
      upload: formTab {
        formFields {
          uploadContainer {
            uploadFlow(input: mediafilesOnly)
            fileUpload: uploadField {
              label(input: "upload-fields.labels.file-upload")
              uploadFieldSize(input: normal)
              uploadFieldType(input: single)
              inputField(type: baseFileUploadField) {
                ...inputfield
              }
            }
          }
          uploadAction: action {
            label(input: "actions.labels.upload")
            icon(input: Upload)
            actionType(input: upload)
            showsFormErrors(input: true)
            actionProgressIndicator {
              type(input: progressSteps)
              prepareStep: step {
                label(input: "actions.progress-steps.prepare")
                stepType(input: prepare)
                status
              }
              uploadStep: step {
                label(input: "actions.progress-steps.upload")
                stepType(input: upload)
                status
              }
            }
          }
        }
      }
    }
  }

  query GetBulkOperationCsvExportKeys($entityType: String!) {
    BulkOperationCsvExportKeys(entityType: $entityType) {
      options {
        icon
        label
        value
      }
    }
  }

  query getFilterMatcherMapping {
    FilterMatcherMapping {
      text
      date
      number
      selection
      boolean
      type
    }
  }

  query getPreviewComponents($entityType: String!) {
    PreviewComponents(entityType: $entityType) {
        __typename
    }
  }

  query GetPermissionMappingPerEntityType($type: String!) {
    PermissionMappingPerEntityType(type: $type)
  }

  query GetPermissionMappingCreate($entityType: String!) {
    PermissionMappingCreate(entityType: $entityType)
  }

  query GetPermissionMappingEntityDetail($id: String!, $entityType: String!) {
    PermissionMappingEntityDetail(id: $id, entityType: $entityType) {
      permission
      hasPermission
    }
  }

  query FetchMediafilesOfEntity($entityIds: [String!]!) {
    FetchMediafilesOfEntity(entityIds: $entityIds) {
      __typename
    }
  }

  mutation updateMetadataWithCsv($entityType: String!, $csv: String!) {
    updateMetadataWithCsv(entityType: $entityType, csv: $csv)
  }
`;
