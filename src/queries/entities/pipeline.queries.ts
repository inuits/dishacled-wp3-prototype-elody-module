import { gql } from "graphql-modules";

export const pipelineQueries = gql`
  fragment minimalPipeline on Pipeline {
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

  fragment fullPipeline on Pipeline {
    intialValues {
      name: keyValue(key: "name", source: metadata)
      description: keyValue(key: "description", source: metadata)
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
            relationType: label(input: "hasRunner")
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetRunnerFilter")
            searchInputType(input: "AdvancedInputType")
            customBulkOperations(input: "GetRunnerOnPipelineBulkOperations")
          }
          processors: entityListElement {
            label(input: "element-labels.processor-element")
            isCollapsed(input: false)
            entityTypes(input: [processor])
            relationType: label(input: "hasProcessor")
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetProcessorFilter")
            searchInputType(input: "AdvancedInputType")
            customBulkOperations(input: "GetProcessorOnPipelineBulkOperations")
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
              label(input: "panel-labels.pipeline-info")
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: false)
              name: metaData {
                label(input: "metadata.labels.name")
                key(input: "name")
              }
              description: metaData {
                label(input: "metadata.labels.description")
                key(input: "description")
              }
            }
          }
        }
      }
    }
  }

  fragment pipelineSortOptions on Pipeline {
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

  fragment filtersForPipeline on Pipeline {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "pipeline")
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

  fragment pipelineBulkOperations on Pipeline {
    bulkOperationOptions {
      options(
        input: [
          {
            icon: Create
            label: "bulk-operations.create-pipeline"
            value: "createEntity"
            primary: true
            actionContext: {
              activeViewMode: readMode
              entitiesSelectionType: noneSelected
              labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
            }
            bulkOperationModal: {
              typeModal: DynamicForm
              formQuery: "GetPipelineCreateForm"
              formRelationType: "isPipelineFor"
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

  query GetPipelineCreateForm {
    GetDynamicForm {
      label(input: "navigation.create-pipeline")
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
          description: metaData {
            label(input: "metadata.labels.description")
            key(input: "description")
            inputField(type: baseTextField) {
              ...inputfield
            }
          }
          createAction: action {
            label(input: "actions.labels.create")
            icon(input: Create)
            actionType(input: submit)
            actionQuery(input: "CreateEntity")
            creationType(input: pipeline)
            showsFormErrors(input: true)
          }
        }
      }
    }
  }

  query GetRunnerOnPipelineBulkOperations {
    CustomBulkOperations {
      bulkOperationOptions {
        options(
          input: [
            {
              icon: PlusCircle
              label: "bulk-operations.add-new-relation"
              value: "createEntity"
              primary: true
              can: ["update:pipeline:has-runner"]
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
            {
              icon: PlusCircle
              label: "bulk-operations.add-existing-relation"
              value: "addRelation"
              can: ["update:pipeline:has-runner"]
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
              can: ["update:pipeline:has-runner"]
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

  query GetProcessorOnPipelineBulkOperations {
    CustomBulkOperations {
      bulkOperationOptions {
        options(
          input: [
            {
              icon: PlusCircle
              label: "bulk-operations.add-new-relation"
              value: "createEntity"
              primary: true
              can: ["update:pipeline:has-processor"]
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
              can: ["update:pipeline:has-processor"]
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
              can: ["update:pipeline:has-processor"]
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
`;
