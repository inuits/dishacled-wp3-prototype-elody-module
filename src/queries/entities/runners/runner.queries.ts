import { gql } from "graphql-modules";

export const runnerQueries = gql`
  fragment minimalRunner on Runner {
    intialValues {
      name: keyValue(key: "name", source: metadata)
      repository: keyValue(key: "repository", source: metadata)
      hasProcessor: keyValue(
        key: "hasProcessor"
        source: relations
        metadataKeyAsLabel: "name"
        formatter: "pill"
      )
    }
    relationValues
    allowedViewModes {
      viewModes(
        input: [{ viewMode: ViewModesList }, { viewMode: ViewModesGrid }]
      ) {
        ...viewModes
      }
    }
    teaserMetadata {
      name: metaData {
        label(input: "metadata.labels.name")
        key(input: "name")
      }
      repository: metaData {
        label(input: "metadata.labels.repository")
        key(input: "repository")
      }
      hasProcessor: metaData {
        label(input: "metadata.labels.processor")
        key(input: "processor")
      }
    }
    ...minimalBaseEntity
  }

  fragment fullRunner on Runner {
    intialValues {
      name: keyValue(key: "name", source: metadata)
      repository: keyValue(key: "repository", source: metadata)
    }
    relationValues
    entityView {
      column {
        size(size: seventy)
        elements {
          processors: entityListElement {
            label(input: "element-labels.processor-element")
            isCollapsed(input: false)
            entityTypes(input: [processor])
            relationType: label(input: "hasProcessor")
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetProcessorFilter")
            searchInputType(input: "AdvancedInputType")
            customBulkOperations(input: "GetProcessorOnRunnerBulkOperations")
          }
        }
      }
      column2: column {
        size(size: thirty)
        elements {
          windowElement {
            label(input: "window-element-labels.info-window")
            expandButtonOptions {
              shown(input: true)
            }
            info: panels {
              label(input: "panel-labels.runner-info")
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
            }
          }
        }
      }
    }
  }

  fragment runnerSortOptions on Runner {
    sortOptions {
      options(
        input: [{ icon: NoIcon, label: "metadata.labels.name", value: "name" }]
      ) {
        icon
        label
        value
      }
    }
  }

  fragment filtersForRunner on Runner {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "runner")
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
      repository: advancedFilter(
        type: text
        key: ["elody:1|metadata.repository.value"]
        label: "metadata.labels.repository"
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

  query GetRunnerCreateForm {
    GetDynamicForm {
      label(input: "navigation.create-runner")
      name: formTab {
        formFields {
          name: metaData {
            label(input: "metadata.labels.name")
            key(input: "name")
            inputField(type: baseTextField) {
              ...inputfield
              validation(input: { value: required }) {
                ...validation
              }
            }
          }
          repository: metaData {
            label(input: "metadata.labels.repository")
            key(input: "repository")
            inputField(type: baseTextField) {
              ...inputfield
              validation(input: { value: required }) {
                ...validation
              }
            }
          }
          createAction: action {
            label(input: "actions.labels.create")
            icon(input: Create)
            actionType(input: submit)
            actionQuery(input: "CreateEntity")
            creationType(input: runner)
            showsFormErrors(input: true)
          }
        }
      }
    }
  }

  query GetProcessorOnRunnerBulkOperations {
    CustomBulkOperations {
      bulkOperationOptions {
        options(
          input: [
            {
              icon: PlusCircle
              label: "bulk-operations.add-new-relation"
              value: "createEntity"
              primary: true
              can: ["update:runner:has-processor"]
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQuery: "GetProcessorCreateForm"
                formRelationType: "isProcessorFor"
                askForCloseConfirmation: true
                neededPermission: cancreate
              }
            }
            {
              icon: PlusCircle
              label: "bulk-operations.add-existing-relation"
              value: "addRelation"
              can: ["update:runner:has-processor"]
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQuery: "GetEntityPickerForm"
                askForCloseConfirmation: true
                neededPermission: canupdate
              }
            }
            {
              label: "bulk-operations.delete-selected"
              value: "deleteEntities"
              primary: false
              can: ["update:runner:has-processor"]
              bulkOperationModal: {
                typeModal: BulkOperationsDeleteEntities
                formQuery: "GetBulkRemovingMediafilesInDetailForm"
                askForCloseConfirmation: false
              }
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: someSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-someselected"
              }
            }
          ]
        ) {
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
  }

  query GetAllRunnerEntities(
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
        relationValues
        ... on JsRunner {
          ...minimalJsRunner
        }
        ... on JvmRunner {
          ...minimalJvmRunner
        }
        ... on PyRunner {
          ...minimalPyRunner
        }
      }
    }
  }

  query GetAllRunnerFilters($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: selection, key: "type") {
          type
          key
          defaultValue(value: ["jsRunner", "jvmRunner", "pyRunner"])
          hidden(value: true)
        }
        id: advancedFilter(
          type: text
          key: ["elody:1|metadata.id.value"]
          label: "metadata.labels.id"
          isDisplayedByDefault: true
        ) {
          type
          key
          label
          isDisplayedByDefault
        }
        hasProcessor: advancedFilter(
          type: selection
          key: ["elody:1|relations.hasProcessor.key"]
          label: "metadata.labels.processor"
          isDisplayedByDefault: true
          useNewWayToFetchOptions: true
          advancedFilterInputForRetrievingOptions: [
            {
              type: text
              key: ["elody:1|properties.name.value"]
              value: "*"
              match_exact: false
            }
          ]
        ) {
          type
          key
          label
          isDisplayedByDefault
          advancedFilterInputForRetrievingOptions {
            type
            key
            value
            item_types
          }
          tooltip(value: true)
        }
      }
    }
  }

  query GetAllRunnerSortOptions($entityType: String!) {
    EntityTypeSortOptions(entityType: $entityType) {
      sortOptions {
        options(
          input: [{ icon: NoIcon, label: "metadata.labels.id", value: "id" }]
        ) {
          icon
          label
          value
        }
      }
    }
  }

  query GetAllRunnerBulkOperations($entityType: String!) {
    BulkOperations(entityType: $entityType) {
      bulkOperationOptions {
        options(
          input: [
            {
              icon: Create
              label: "bulk-operations.create-jsrunner"
              value: "createEntity"
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQuery: "GetJsRunnerCreateForm"
                formRelationType: "isRunnerFor"
                askForCloseConfirmation: true
                neededPermission: cancreate
              }
            }
            {
              icon: Create
              label: "bulk-operations.create-jvmrunner"
              value: "createEntity"
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQuery: "GetJvmRunnerCreateForm"
                formRelationType: "isRunnerFor"
                askForCloseConfirmation: true
                neededPermission: cancreate
              }
            }
            {
              icon: Create
              label: "bulk-operations.create-pyrunner"
              value: "createEntity"
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQuery: "GetPyRunnerCreateForm"
                formRelationType: "isRunnerFor"
                askForCloseConfirmation: true
                neededPermission: cancreate
              }
            }
          ]
        ) {
          icon
          label
          value
          primary
          actionContext {
            ...actionContext
          }
          bulkOperationModal {
            ...bulkOperationModal
          }
        }
      }
    }
  }
`;
