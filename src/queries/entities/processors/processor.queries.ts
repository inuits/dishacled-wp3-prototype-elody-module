import { gql } from "graphql-modules";

export const processorQueries = gql`
  fragment minimalProcessor on Processor {
    intialValues {
      name: keyValue(key: "name", source: metadata)
      hasRunner: keyValue(
        key: "hasRunner"
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
      hasRunner: metaData {
        label(input: "metadata.labels.runner")
        key(input: "hasRunner")
      }
    }
    ...minimalBaseEntity
  }

  fragment fullProcessor on Processor {
    intialValues {
      name: keyValue(key: "name", source: metadata)
    }
    relationValues
    entityView {
      column {
        size(size: seventy)
        elements {
          runners: entityListElement {
            label(input: "element-labels.runner-element")
            isCollapsed(input: false)
            entityTypes(input: [jsRunner, jvmRunner, pyRunner])
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetRelatedRunnerFilter")
            searchInputType(input: "AdvancedInputType")
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
              label(input: "panel-labels.processor-info")
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: false)
              name: metaData {
                label(input: "metadata.labels.name")
                key(input: "name")
              }
            }
          }
        }
      }
    }
  }

  fragment processorSortOptions on Processor {
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

  fragment filtersForProcessor on Processor {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "processor")
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

  fragment processorBulkOperations on Processor {
    bulkOperationOptions {
      options(
        input: [
          {
            icon: Create
            label: "bulk-operations.create-processor"
            value: "createEntity"
            primary: true
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

  query GetProcessorCreateForm {
    GetDynamicForm {
      label(input: "navigation.create-processor")
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
          createAction: action {
            label(input: "actions.labels.create")
            icon(input: Create)
            actionType(input: submit)
            actionQuery(input: "CreateEntity")
            creationType(input: processor)
            showsFormErrors(input: true)
          }
        }
      }
    }
  }

  query GetAllProcessorEntities(
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
        ... on JvmRmlProcessor {
          ...minimalJvmRmlProcessor
        }
        ... on PyLogProcessor {
          ...minimalPyLogProcessor
        }
        ... on TsHttpUtilsProcessor {
          ...minimalTsHttpUtilsProcessor
        }
      }
    }
  }

  query GetAllProcessorFilters($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: selection, key: "type") {
          type
          key
          defaultValue(
            value: ["jvmRmlProcessor", "pyLogProcessor", "tsHttpUtilsProcessor"]
          )
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
        hasRunner: advancedFilter(
          type: selection
          key: ["elody:1|relations.hasRunner.key"]
          label: "metadata.labels.runner"
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

  query GetAllProcessorSortOptions($entityType: String!) {
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

  query GetAllProcessorBulkOperations($entityType: String!) {
    BulkOperations(entityType: $entityType) {
      bulkOperationOptions {
        options(
          input: [
            {
              icon: Create
              label: "bulk-operations.create-jvm-rml-processor"
              value: "createEntity"
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQuery: "GetJvmRmlProcessorCreateForm"
                formRelationType: "isProcessorFor"
                askForCloseConfirmation: true
                neededPermission: cancreate
              }
            }
            {
              icon: Create
              label: "bulk-operations.create-py-log-processor"
              value: "createEntity"
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQuery: "GetPyLogProcessorCreateForm"
                formRelationType: "isProcessorFor"
                askForCloseConfirmation: true
                neededPermission: cancreate
              }
            }
            {
              icon: Create
              label: "bulk-operations.create-ts-http-utils-processor"
              value: "createEntity"
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQuery: "GetTsHttpUtilsProcessorCreateForm"
                formRelationType: "isProcessorFor"
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
