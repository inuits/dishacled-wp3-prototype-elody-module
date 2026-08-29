import { gql } from "graphql-modules";

export const githubProcessorQueries = gql`
  fragment minimalGithubProcessor on GithubProcessor {
    processorConfig
    intialValues {
      ...typePillsIntialValues
      # >>> generated:component-initial-values from src/ui/dishacled.ui.ttl — do not edit by hand
      name: keyValue(key: "name", source: metadata)
      description: keyValue(key: "description", source: metadata)
      repository: keyValue(key: "repository", source: metadata)
      runtime: keyValue(key: "runtime", source: metadata, formatter: "pill|auto")
      # <<< generated:component-initial-values
    }
    relationValues
    # >>> generated:component-view-modes from src/ui/dishacled.ui.ttl — do not edit by hand
    allowedViewModes {
      viewModes(
        input: [
          {
            viewMode: ViewModesList
            config: [
              { key: "multiLine", value: true }
              { key: "multiLineColumns", value: 3 }
            ]
          }
          { viewMode: ViewModesGrid }
          { viewMode: ViewModesPipeline }
        ]
      ) {
        ...viewModes
      }
    }
    # <<< generated:component-view-modes
    teaserMetadata {
      ...typePillsTeaserMetadata
      forceShowContextMenuActions(input: true)
      contextMenuActions {
        ...basicContextMenuActions
        configure: doElodyAction {
          action(input: UpdateMetadata)
          formQuery(input: "ProcessorRelationConfig")
          formFlow(input: Update)
          formTitle(input: "modals.configureProcessor.title")
          label(
            input: "contextMenu.contextMenuElodyAction.configureProcessor"
          )
          icon(input: "Settings")
          __typename
        }
        connect: doElodyAction {
          action(input: UpdateMetadata)
          formQuery(input: "ProcessorConnectionsConfig")
          formFlow(input: Update)
          formTitle(input: "modals.connectProcessor.title")
          label(input: "contextMenu.contextMenuElodyAction.connectProcessor")
          icon(input: "Link")
          __typename
        }
      }
      # no runtime on the card: in the logical model that is a build detail
      # (the exports derive the runner from it; users never choose it)
      # >>> generated:component-teaser-fields from src/ui/dishacled.ui.ttl — do not edit by hand
      name: metaData {
        label(input: "metadata.labels.name")
        key(input: "name")
        colSpan(input: "2")
      }
      description: metaData {
        label(input: "metadata.labels.description")
        key(input: "description")
        colSpan(input: "3")
      }
      # <<< generated:component-teaser-fields
    }
    ...minimalBaseEntity
  }

  fragment fullGithubProcessor on GithubProcessor {
    intialValues {
      name: keyValue(key: "name", source: metadata)
      repository: keyValue(key: "repository", source: metadata)
      description: keyValue(key: "description", source: metadata)
      url: keyValue(key: "url", source: metadata)
      runtime: keyValue(key: "runtime", source: metadata)
      defaultBranch: keyValue(key: "defaultBranch", source: metadata)
      owner: keyValue(key: "owner", source: metadata)
      stars: keyValue(key: "stars", source: metadata)
      language: keyValue(key: "language", source: metadata)
      shaclFiles: keyValue(key: "shaclFiles", source: metadata)
    }
    relationValues
    entityView {
      column {
        size(size: seventy)
        elements {
          windowElement {
            label(input: "window-element-labels.info-window")
            expandButtonOptions {
              shown(input: true)
            }
            repoInfo: panels {
              panelHeaderContent(panelHeaderContentInput: { label: "panel-labels.repository-info" }) {
                label
              }
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: false)
              name: metaData {
                label(input: "metadata.labels.name")
                key(input: "name")
              }
              repository: metaData {
                label(input: "metadata.labels.repository")
                key(input: "repository")
              }
              description: metaData {
                label(input: "metadata.labels.description")
                key(input: "description")
              }
              url: metaData {
                label(input: "metadata.labels.url")
                key(input: "url")
              }
              owner: metaData {
                label(input: "metadata.labels.owner")
                key(input: "owner")
              }
              language: metaData {
                label(input: "metadata.labels.language")
                key(input: "language")
              }
              stars: metaData {
                label(input: "metadata.labels.stars")
                key(input: "stars")
              }
              defaultBranch: metaData {
                label(input: "metadata.labels.default-branch")
                key(input: "defaultBranch")
              }
            }
            shaclInfo: panels {
              panelHeaderContent(panelHeaderContentInput: { label: "panel-labels.shacl-files" }) {
                label
              }
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: false)
              shaclFiles: metaData {
                label(input: "metadata.labels.shacl-files")
                key(input: "shaclFiles")
              }
            }
          }
        }
      }
      column2: column {
        size(size: thirty)
        elements {
          windowElement {
            label(input: "window-element-labels.import-config")
            expandButtonOptions {
              shown(input: true)
            }
            importConfig: panels {
              panelHeaderContent(panelHeaderContentInput: { label: "panel-labels.import-configuration" }) {
                label
              }
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: false)
              runtime: metaData {
                label(input: "metadata.labels.runtime")
                key(input: "runtime")
              }
            }
          }
        }
      }
    }
  }

  fragment githubProcessorSortOptions on GithubProcessor {
    # >>> generated:component-sort-options from src/ui/dishacled.ui.ttl — do not edit by hand
    sortOptions {
      options(
        input: [
          {
            icon: NoIcon
            label: "metadata.labels.name"
            value: "name"
          }
        ]
      ) {
        icon
        label
        value
      }
    }
    # <<< generated:component-sort-options
  }

  fragment filtersForGithubProcessor on GithubProcessor {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "githubProcessor")
        hidden(value: true)
      }
      name: advancedFilter(
        type: text
        key: ["elody:1|metadata.name.value"]
        label: "metadata.labels.name"
        isDisplayedByDefault: true
      ) {
        type
        key
        label
        isDisplayedByDefault
        tooltip(value: true)
      }
    }
  }

  fragment githubProcessorBulkOperations on GithubProcessor {
    bulkOperationOptions {
      options(input: []) {
        icon
        label
        value
        primary
        can
        actionContext {
          ...actionContext
        }
        bulkOperationModal {
          ...bulkOperationModal
        }
      }
    }
  }

  query GetGithubProcessorEntities(
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
        ... on GithubProcessor {
          ...minimalGithubProcessor
        }
      }
    }
  }

  query GetGithubProcessorFilters($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      ... on GithubProcessor {
        ...filtersForGithubProcessor
      }
    }
  }

  query GetGithubProcessorSortOptions($entityType: String!) {
    EntityTypeSortOptions(entityType: $entityType) {
      ... on GithubProcessor {
        ...githubProcessorSortOptions
      }
    }
  }

  query GetGithubProcessorBulkOperations($entityType: String!) {
    BulkOperations(entityType: $entityType) {
      ... on GithubProcessor {
        ...githubProcessorBulkOperations
      }
    }
  }

  # Field-source query for the generic relation-config modal. Referenced by name
  # via the configure action's formQuery input ("ProcessorRelationConfig") and
  # resolved at runtime by useImport().loadDocument. Returns the SHACL-derived,
  # channel-injected field set for the given processor id.
  query ProcessorRelationConfig($id: String!) {
    ProcessorConfigForm(id: $id)
  }

  # Field-source query for the connect modal, referenced by name via the
  # connect action's formQuery input ("ProcessorConnectionsConfig"). Takes the
  # component id and the pipeline it sits in, and returns one producer
  # dropdown per input port. Saved onto the same hasProcessor relation the
  # config modal writes to, under dotted connections.<port>.* keys.
  query ProcessorConnectionsConfig($id: String!, $parentEntityId: String) {
    ProcessorConnectionForm(id: $id, parentEntityId: $parentEntityId)
  }
`;
