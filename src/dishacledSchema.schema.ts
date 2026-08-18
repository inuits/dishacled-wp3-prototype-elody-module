import { gql } from "graphql-modules";

export const dishacledSchema = gql`
  enum RouteNames {
    Pipelines
    Runners
    Channels
    Users
    Alerts
  }

  enum Entitytyping {
    pipeline
    runner
    jsRunner
    jvmRunner
    pyRunner
    githubProcessor
    channel
    user
    tenant
    alert
  }

  #  enum KeyValueSource {
  #
  #  }

  #  enum CreateableEntityTypes {
  #
  #  }

  # Extend Collection with githubProcessors for HTTP-backed GitHub discovery
  # and alerts, which are read live from the SPARQL error graph.
  enum Collection {
    githubProcessors
    alerts
  }

  enum UploadEntityTypes {
    none
  }

  # Merge with BaseFieldType from baseSchema
   enum BaseFieldType {
    hasWriterField
   }

  interface Entity {
    id: String!
    uuid: String!
    type: String!
    teaserMetadata: teaserMetadata
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
  }

  type Pipeline implements Entity {
    id: String!
    uuid: String!
    type: String!
    pipelineConnections: JSON
    pipelineValidation: JSON
    teaserMetadata: teaserMetadata
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    previewComponent: PreviewComponent
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
  }

  type Runner implements Entity {
    id: String!
    uuid: String!
    type: String!
    teaserMetadata: teaserMetadata
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    previewComponent: PreviewComponent
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
  }

  type JsRunner implements Entity {
    id: String!
    uuid: String!
    type: String!
    teaserMetadata: teaserMetadata
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    previewComponent: PreviewComponent
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
  }

  type JvmRunner implements Entity {
    id: String!
    uuid: String!
    type: String!
    teaserMetadata: teaserMetadata
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    previewComponent: PreviewComponent
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
  }

  type PyRunner implements Entity {
    id: String!
    uuid: String!
    type: String!
    teaserMetadata: teaserMetadata
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    previewComponent: PreviewComponent
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
  }

  type GithubProcessor implements Entity {
    id: String!
    uuid: String!
    type: String!
    teaserMetadata: teaserMetadata
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    previewComponent: PreviewComponent
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
    processorConfig: JSON
    componentContract: JSON
    componentPorts: JSON
  }

  # Demonstrator alerts, read live from the SPARQL error graph.
  #
  # shapeFields carries the detail view's fields derived from lblodsh:ErrorShape
  # with this alert's values merged in, so the view is generated from the shape
  # rather than enumerated per field in a fragment. Same JSON-field-set pattern
  # as processorConfig above.
  type Alert implements Entity {
    id: String!
    uuid: String!
    type: String!
    teaserMetadata: teaserMetadata
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    previewComponent: PreviewComponent
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
    shapeFields: JSON
  }

  type Channel implements Entity {
    id: String!
    uuid: String!
    type: String!
    teaserMetadata: teaserMetadata
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    previewComponent: PreviewComponent
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
  }

  type User implements Entity {
    id: String!
    uuid: String!
    type: String!
    teaserMetadata: teaserMetadata
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    previewComponent: PreviewComponent
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
  }

  type Tenant implements Entity {
    id: String!
    uuid: String!
    type: String!
    teaserMetadata: teaserMetadata
    title: [MetadataAndRelation]
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
  }

  #  Should be removed at some point
  type Asset implements Entity {
    id: String!
    uuid: String!
    type: String!
    teaserMetadata: teaserMetadata
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    previewComponent: PreviewComponent
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
  }

  #  Should be removed at some point
  type Media implements Entity {
    id: String!
    uuid: String!
    type: String!
    teaserMetadata: teaserMetadata
    intialValues: IntialValues!
    allowedViewModes: AllowedViewModes
    relationValues: JSON
    entityView: ColumnList!
    advancedFilters: AdvancedFilters
    sortOptions: SortOptions
    bulkOperationOptions: BulkOperationOptions
    previewComponent: PreviewComponent
    deleteQueryOptions: DeleteQueryOptions
    mapElement: MapElement
  }

  type Query {
    ProcessorConfigForm(id: String!): JSON
    ComponentContract(id: String!): JSON
    # Connect form for one component inside one pipeline. parentEntityId is
    # the pipeline: without it there is no set of sibling components to offer
    # as producers.
    ProcessorConnectionForm(id: String!, parentEntityId: String): JSON
    PipelineConnections(id: String!): JSON
    # Chain validation: per-connection verdicts plus the structured violation
    # list, each entry {from, to, constraint, expected, actual, message}.
    PipelineValidation(id: String!): JSON
    BulkOperationsRelationForm: WindowElement!
  }

  type Mutation {
    CreateEntity(entity: EntityInput!): Entity
  }
`;
