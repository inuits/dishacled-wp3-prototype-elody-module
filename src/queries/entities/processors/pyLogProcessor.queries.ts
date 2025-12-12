import { gql } from "graphql-modules";

export const pyLogProcessorQueries = gql`
  fragment minimalPyLogProcessor on PyLogProcessor {
    intialValues {
      ...typePillsIntialValues
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
      ...typePillsTeaserMetadata
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

  fragment fullPyLogProcessor on PyLogProcessor {
    intialValues {
      name: keyValue(key: "name", source: metadata)
      reader: keyValue(key: "reader", source: relations)
      hasWriter: keyValue(key: "hasWriter", source: relations, metadataKeyAsLabel: "name", relationEntityType: "channel")
      logLabel: keyValue(key: "logLabel", source: metadata)
      level: keyValue(key: "level", source: metadata)
      raw: keyValue(key: "raw", source: metadata)
      sendWriter: keyValue(key: "sendWriter", source: relations)
      msg: keyValue(key: "msg", source: metadata)
    }
    relationValues
    entityView {
      column {
        size(size: seventy)
        elements {
          runners: entityListElement {
            label(input: "element-labels.runner-element")
            isCollapsed(input: false)
            entityTypes(input: [pyRunner])
            relationType: label(input: "hasRunner")
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetRunnerRelatedToProcessorFilter")
            searchInputType(input: "AdvancedInputType")
            customBulkOperations(
              input: "GetRunnerOnPyLogProcessorBulkOperations"
            )
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
            logProcessor: panels {
              label(input: "panel-labels.log-processor")
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: true)
              reader: metaData {
                label(input: "metadata.labels.reader")
                key(input: "reader")
              }
             hasWriter: metaData {
                label(input: "metadata.labels.writer")
                key(input: "hasWriter")
                inputField(type: hasWriterField){
                  ...inputfield
                }
              }
              logLabel: metaData {
                label(input: "metadata.labels.label")
                key(input: "logLabel")
                inputField(type: baseTextField) {
                  ...inputfield
                }
              }
              level: metaData {
                label(input: "metadata.labels.level")
                key(input: "level")
                inputField(type: baseTextField) {
                  ...inputfield
                }
              }
              raw: metaData {
                label(input: "metadata.labels.raw")
                key(input: "raw")
                inputField(type: baseCheckbox) {
                  ...inputfield
                }
              }
            }
            sendProcessor: panels {
              label(input: "panel-labels.send-processor")
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: true)
              sendWriter: metaData {
                label(input: "metadata.labels.writer")
                key(input: "sendWriter")
              }
              msg: metaData {
                label(input: "metadata.labels.msg")
                key(input: "msg")
              }
            }
          }
        }
      }
    }
  }

  fragment pyLogProcessorSortOptions on PyLogProcessor {
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

  fragment filtersForPyLogProcessor on PyLogProcessor {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "pyLogProcessor")
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

  fragment pyLogProcessorBulkOperations on PyLogProcessor {
    bulkOperationOptions {
      options(
        input: [
          {
            icon: Create
            label: "bulk-operations.create-py-log-processor"
            value: "createEntity"
            primary: true
            actionContext: {
              activeViewMode: readMode
              entitiesSelectionType: noneSelected
              labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
            }
            bulkOperationModal: {
              typeModal: DynamicForm
              formQuery: "GetPyLogProcessorCreateForm"
              formRelationType: "isPyLogProcessorFor"
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

  query GetPyLogProcessorCreateForm {
    GetDynamicForm {
      label(input: "navigation.create-py-log-processor")
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
            creationType(input: pyLogProcessor)
            showsFormErrors(input: true)
          }
        }
      }
    }
  }

  query GetRunnerOnPyLogProcessorBulkOperations {
    CustomBulkOperations {
      bulkOperationOptions {
        options(
          input: [
            {
              icon: PlusCircle
              label: "bulk-operations.create-pyrunner"
              value: "createEntity"
              can: ["update:pyLogProcessor:has-runner"]
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
            {
              icon: PlusCircle
              label: "bulk-operations.existing-runner"
              value: "addRelation"
              can: ["update:pyLogProcessor:has-runner"]
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
              can: ["update:pyLogProcessor:has-runner"]
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

  query GetPyLogProcessorFilter($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: type) {
          type
          defaultValue(value: "pyLogProcessor")
          hidden(value: true)
        }
        relation: advancedFilter(
          type: selection
          key: ["elody:1|identifiers"]
        ) {
          type
          key
          defaultValue(value: "$entity.relationValues.hasProcessor.key")
          hidden(value: true)
        }
      }
    }
  }
`;
