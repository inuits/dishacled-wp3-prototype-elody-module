import { gql } from "graphql-modules";

export const tsHttpUtilsProcessorQueries = gql`
  fragment minimalTsHttpUtilsProcessor on TsHttpUtilsProcessor {
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

  fragment fullTsHttpUtilsProcessor on TsHttpUtilsProcessor {
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

  fragment tsHttpUtilsProcessorSortOptions on TsHttpUtilsProcessor {
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

  fragment filtersForTsHttpUtilsProcessor on TsHttpUtilsProcessor {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "tsHttpUtilsProcessor")
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

  fragment tsHttpUtilsProcessorBulkOperations on TsHttpUtilsProcessor {
    bulkOperationOptions {
      options(
        input: [
          {
            icon: Create
            label: "bulk-operations.create-ts-http-utils-processor"
            value: "createEntity"
            primary: true
            actionContext: {
              activeViewMode: readMode
              entitiesSelectionType: noneSelected
              labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
            }
            bulkOperationModal: {
              typeModal: DynamicForm
              formQuery: "GetTsHttpUtilsProcessorCreateForm"
              formRelationType: "isTsHttpUtilsProcessorFor"
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

  query GetTsHttpUtilsProcessorCreateForm {
    GetDynamicForm {
      label(input: "navigation.create-ts-http-utils-processor")
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
            creationType(input: tsHttpUtilsProcessor)
            showsFormErrors(input: true)
          }
        }
      }
    }
  }
`;
