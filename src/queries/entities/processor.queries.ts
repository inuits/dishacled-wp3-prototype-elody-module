import { gql } from "graphql-modules";

export const processorQueries = gql`
  fragment minimalProcessor on Processor {
    intialValues {
      name: keyValue(key: "name", source: metadata)
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
            entityTypes(input: [runner])
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetRunnerFilter")
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

  query GetRunnerFilter($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: type) {
          type
          defaultValue(value: "runner")
          hidden(value: true)
        }
        relation: advancedFilter(
          type: selection
          key: ["elody:1|identifiers"]
        ) {
          type
          key
          defaultValue(value: "$entity.relationValues.hasRunner.key")
          hidden(value: true)
        }
      }
    }
  }
`;
