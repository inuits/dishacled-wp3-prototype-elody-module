import { gql } from "graphql-modules";

export const jvmRunnerQueries = gql`
  fragment minimalJvmRunner on JvmRunner {
    intialValues {
      ...typePillsIntialValues
      name: keyValue(key: "name", source: metadata)
      jar: keyValue(key: "jar", source: metadata)
      clazz: keyValue(key: "clazz", source: metadata)
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
      ...typePillsTeaserMetadata
      name: metaData {
        label(input: "metadata.labels.name")
        key(input: "name")
      }
      jar: metaData {
        label(input: "metadata.labels.jar")
        key(input: "jar")
      }
      clazz: metaData {
        label(input: "metadata.labels.clazz")
        key(input: "clazz")
      }
      hasProcessor: metaData {
        label(input: "metadata.labels.processor")
        key(input: "processor")
      }
    }
    ...minimalBaseEntity
  }

  fragment fullJvmRunner on JvmRunner {
    intialValues {
      name: keyValue(key: "name", source: metadata)
      jar: keyValue(key: "jar", source: metadata)
      clazz: keyValue(key: "clazz", source: metadata)
    }
    relationValues
    entityView {
      column {
        size(size: seventy)
        elements {
          processors: entityListElement {
            label(input: "element-labels.processor-element")
            isCollapsed(input: false)
            entityTypes(input: [jvmRmlProcessor])
            relationType: label(input: "hasProcessor")
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetJvmRmlProcessorFilter")
            searchInputType(input: "AdvancedInputType")
            customBulkOperations(input: "GetProcessorOnJvmRunnerBulkOperations")
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
              jar: metaData {
                label(input: "metadata.labels.jar")
                key(input: "jar")
              }
              clazz: metaData {
                label(input: "metadata.labels.clazz")
                key(input: "clazz")
              }
            }
          }
        }
      }
    }
  }

  fragment jvmRunnerSortOptions on JvmRunner {
    sortOptions {
      options(
        input: [{ icon: NoIcon, label: "metadata.labels.jar", value: "name" }]
      ) {
        icon
        label
        value
      }
    }
  }

  fragment filtersForJvmRunner on JvmRunner {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "jvmRunner")
        hidden(value: true)
      }
      name: advancedFilter(
        type: text
        key: ["elody:1|metadata.jar.value"]
        label: "metadata.labels.jar"
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
        key: ["elody:1|metadata.clazz.value"]
        label: "metadata.labels.clazz"
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

  fragment jvmRunnerBulkOperations on JvmRunner {
    bulkOperationOptions {
      options(
        input: [
          {
            icon: Create
            label: "bulk-operations.create-jvmrunner"
            value: "createEntity"
            primary: true
            actionContext: {
              activeViewMode: readMode
              entitiesSelectionType: noneSelected
              labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
            }
            bulkOperationModal: {
              typeModal: DynamicForm
              formQuery: "GetJvmRunnerCreateForm"
              formRelationType: "isJvmRunnerFor"
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

  query GetJvmRunnerCreateForm {
    GetDynamicForm {
      label(input: "navigation.create-jvmrunner")
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
          jar: metaData {
            label(input: "metadata.labels.jar")
            key(input: "jar")
            inputField(type: baseTextField) {
              ...inputfield
              validation(input: { value: required }) {
                ...validation
              }
            }
          }
          clazz: metaData {
            label(input: "metadata.labels.clazz")
            key(input: "clazz")
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
            creationType(input: jvmRunner)
            showsFormErrors(input: true)
          }
        }
      }
    }
  }

  query GetProcessorOnJvmRunnerBulkOperations {
    CustomBulkOperations {
      bulkOperationOptions {
        options(
          input: [
            {
              icon: PlusCircle
              label: "bulk-operations.add-new-relation"
              value: "createEntity"
              primary: true
              can: ["update:jvmrunner:has-processor"]
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
              icon: PlusCircle
              label: "bulk-operations.add-existing-relation"
              value: "addRelation"
              can: ["update:jvmrunner:has-processor"]
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
              can: ["update:jvmrunner:has-processor"]
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
