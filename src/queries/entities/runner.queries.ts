import { gql } from "graphql-modules";

export const runnerQueries = gql`
  fragment minimalRunner on Runner {
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

  fragment fullRunner on Runner {
    intialValues {
      name: keyValue(key: "name", source: metadata)
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
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetProcessorFilter")
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
              label(input: "panel-labels.runner-info")
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
    }
  }

  fragment runnerBulkOperations on Runner {
    bulkOperationOptions {
      options(
        input: [
          {
            icon: Create
            label: "bulk-operations.create-runner"
            value: "createEntity"
            primary: true
            actionContext: {
              activeViewMode: readMode
              entitiesSelectionType: noneSelected
              labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
            }
            bulkOperationModal: {
              typeModal: DynamicForm
              formQuery: "GetRunnerCreateForm"
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

  query GetProcessorFilter($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: type) {
          type
          defaultValue(value: "processor")
          hidden(value: true)
        }
        relation: advancedFilter(
          type: selection
          key: ["elody:1|identifiers"]
        ) {
          type
          key
          defaultValue(value: "$entity.relationValues.isRunnerFor.key")
          hidden(value: true)
        }
      }
    }
  }
`;
