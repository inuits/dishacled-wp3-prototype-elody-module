import { gql } from "graphql-modules";

export const jsRunnerQueries = gql`
  fragment minimalJsRunner on JsRunner {
    intialValues {
      ...typePillsIntialValues
      location: keyValue(key: "location", source: metadata)
      file: keyValue(key: "file", source: metadata)
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
      location: metaData {
        label(input: "metadata.labels.location")
        key(input: "location")
      }
      file: metaData {
        label(input: "metadata.labels.file")
        key(input: "file")
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

  fragment fullJsRunner on JsRunner {
    intialValues {
      location: keyValue(key: "location", source: metadata)
      file: keyValue(key: "file", source: metadata)
      clazz: keyValue(key: "clazz", source: metadata)
    }
    relationValues
    entityView {
      column {
        size(size: seventy)
        elements {
          processors: entityListElement {
            label(input: "element-labels.jsrunner.processor-element")
            isCollapsed(input: false)
            entityTypes(input: [processor])
            relationType: label(input: "hasProcessor")
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetTsHttpUtilsProcessorFilter")
            searchInputType(input: "AdvancedInputType")
            customBulkOperations(input: "GetProcessorOnJsRunnerBulkOperations")
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
              location: metaData {
                label(input: "metadata.labels.location")
                key(input: "location")
              }
              file: metaData {
                label(input: "metadata.labels.file")
                key(input: "file")
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

  fragment jsRunnerSortOptions on JsRunner {
    sortOptions {
      options(
        input: [
          { icon: NoIcon, label: "metadata.labels.location", value: "location" }
        ]
      ) {
        icon
        label
        value
      }
    }
  }

  fragment filtersForJsRunner on JsRunner {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "jsRunner")
        hidden(value: true)
      }
      location: advancedFilter(
        type: text
        key: ["elody:1|metadata.location.value"]
        label: "metadata.labels.location"
        isDisplayedByDefault: true
      ) {
        type
        key
        label
        isDisplayedByDefault
        tooltip(value: true)
      }
      file: advancedFilter(
        type: text
        key: ["elody:1|metadata.file.value"]
        label: "metadata.labels.file"
        isDisplayedByDefault: true
      ) {
        type
        key
        label
        isDisplayedByDefault
        tooltip(value: true)
      }
      clazz: advancedFilter(
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

  fragment jsRunnerBulkOperations on JsRunner {
    bulkOperationOptions {
      options(
        input: [
          {
            icon: Create
            label: "bulk-operations.create-jsrunner"
            value: "createEntity"
            primary: true
            actionContext: {
              activeViewMode: readMode
              entitiesSelectionType: noneSelected
              labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
            }
            bulkOperationModal: {
              typeModal: DynamicForm
              formQuery: "GetJsRunnerCreateForm"
              formRelationType: "isJsRunnerFor"
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

  query GetJsRunnerCreateForm {
    GetDynamicForm {
      label(input: "navigation.create-jsrunner")
      name: formTab {
        formFields {
          location: metaData {
            label(input: "metadata.labels.location")
            key(input: "location")
            inputField(type: baseTextField) {
              ...inputfield
              validation(input: { value: required }) {
                ...validation
              }
            }
          }
          file: metaData {
            label(input: "metadata.labels.file")
            key(input: "file")
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
            creationType(input: jsRunner)
            showsFormErrors(input: true)
          }
        }
      }
    }
  }

  query GetProcessorOnJsRunnerBulkOperations {
    CustomBulkOperations {
      bulkOperationOptions {
        options(
          input: [
            {
              icon: PlusCircle
              label: "bulk-operations.add-new-relation"
              value: "createEntity"
              primary: true
              can: ["update:jsrunner:has-processor"]
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
              can: ["update:jsrunner:has-processor"]
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
              can: ["update:jsrunner:has-processor"]
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
