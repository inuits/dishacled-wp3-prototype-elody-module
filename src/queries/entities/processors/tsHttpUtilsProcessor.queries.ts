import { gql } from "graphql-modules";

export const tsHttpUtilsProcessorQueries = gql`
  fragment minimalTsHttpUtilsProcessor on TsHttpUtilsProcessor {
    intialValues {
      ...typePillsIntialValues
      name: keyValue(key: "name", source: metadata)
      isProcessorFor: keyValue(
        key: "isProcessorFor"
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
      isProcessorFor: metaData {
        label(input: "metadata.labels.runner")
        key(input: "isProcessorFor")
      }
    }
    ...minimalBaseEntity
  }

  fragment fullTsHttpUtilsProcessor on TsHttpUtilsProcessor {
    intialValues {
      name: keyValue(key: "name", source: metadata)
      authType: keyValue(key: "authType", source: metadata)
      method: keyValue(key: "method", source: metadata)
      headers: keyValue(key: "headers", source: metadata)
      acceptStatusCode: keyValue(key: "acceptStatusCode", source: metadata)
      closeOnEnd: keyValue(key: "closeOnEnd", source: metadata)
      timeOutMilliseconds: keyValue(
        key: "timeOutMilliseconds"
        source: metadata
      )
      auth: keyValue(key: "auth", source: metadata)
      cron: keyValue(key: "cron", source: metadata)
      runOnInit: keyValue(key: "runOnInit", source: metadata)
      errorsAreFatal: keyValue(key: "errorsAreFatal", source: metadata)
      outputAsBuffer: keyValue(key: "outputAsBuffer", source: metadata)
      url: keyValue(key: "url", source: metadata)
      hasWriter: keyValue(key: "hasWriter", source: relations, metadataKeyAsLabel: "name", relationEntityType: "channel")
      options: keyValue(key: "options", source: metadata)
    }
    relationValues
    entityView {
      column {
        size(size: seventy)
        elements {
          runners: entityListElement {
            label(input: "element-labels.runner-element")
            isCollapsed(input: false)
            entityTypes(input: [jsRunner])
            relationType: label(input: "hasRunner")
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetRunnerRelatedToProcessorFilter")
            searchInputType(input: "AdvancedInputType")
            customBulkOperations(
              input: "GetRunnerOnTsHttpUtilsProcessorBulkOperations"
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
            auth: panels {
              label(input: "panel-labels.auth")
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: true)
              authType: metaData {
                label(input: "metadata.labels.auth-type")
                key(input: "authType")
                inputField(type: baseTextField) {
                  ...inputfield
                  validation(input: { value: required }) {
                    ...validation
                  }
                }
              }
            }
            fetchOptions: panels {
              label(input: "panel-labels.fetch-options")
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: true)
              method: metaData {
                label(input: "metadata.labels.method")
                key(input: "method")
                inputField(type: baseTextField) {
                  ...inputfield
                  validation(input: { value: required }) {
                    ...validation
                  }
                }
              }
              headers: metaData {
                label(input: "metadata.labels.headers")
                key(input: "headers")
                inputField(type: baseTextField) {
                  ...inputfield
                }
              }
              acceptStatusCode: metaData {
                label(input: "metadata.labels.accept-status-code")
                key(input: "acceptStatusCode")
                inputField(type: baseTextField) {
                  ...inputfield
                }
              }
              closeOnEnd: metaData {
                label(input: "metadata.labels.close-on-end")
                key(input: "closeOnEnd")
                inputField(type: baseCheckbox) {
                  ...inputfield
                }
              }
              timeOutMilliseconds: metaData {
                label(input: "metadata.labels.time-out-milliseconds")
                key(input: "timeOutMilliseconds")
                inputField(type: baseNumberField) {
                  ...inputfield
                }
              }
              auth: metaData {
                label(input: "metadata.labels.auth")
                key(input: "auth")
              }
              cron: metaData {
                label(input: "metadata.labels.cron")
                key(input: "cron")
                inputField(type: baseTextField) {
                  ...inputfield
                }
              }
              runOnInit: metaData {
                label(input: "metadata.labels.run-on-init")
                key(input: "runOnInit")
                inputField(type: baseCheckbox) {
                  ...inputfield
                }
              }
              errorsAreFatal: metaData {
                label(input: "metadata.labels.errors-are-fatal")
                key(input: "errorsAreFatal")
                inputField(type: baseCheckbox) {
                  ...inputfield
                }
              }
              outputAsBuffer: metaData {
                label(input: "metadata.labels.output-as-buffer")
                key(input: "outputAsBuffer")
                inputField(type: baseCheckbox) {
                  ...inputfield
                }
              }
            }
            fetch: panels {
              label(input: "panel-labels.fetch")
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: true)
              url: metaData {
                label(input: "metadata.labels.url")
                key(input: "url")
                inputField(type: baseTextField) {
                  ...inputfield
                  validation(input: { value: required }) {
                    ...validation
                  }
                }
              }
              hasWriter: metaData {
                label(input: "metadata.labels.writer")
                key(input: "hasWriter")
                inputField(type: hasWriterField){
                  ...inputfield
                }
              }
              options: metaData {
                label(input: "metadata.labels.options")
                key(input: "options")
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

  query GetRunnerOnTsHttpUtilsProcessorBulkOperations {
    CustomBulkOperations {
      bulkOperationOptions {
        options(
          input: [
            {
              icon: PlusCircle
              label: "bulk-operations.create-jsrunner"
              value: "createEntity"
              can: ["update:tsHttpUtilsProcessor:has-runner"]
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
              icon: PlusCircle
              label: "bulk-operations.existing-runner"
              value: "addRelation"
              can: ["update:tsHttpUtilsProcessor:has-runner"]
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
              can: ["update:tsHttpUtilsProcessor:has-runner"]
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

  query GetTsHttpUtilsProcessorFilter($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: type) {
          type
          defaultValue(value: "tsHttpUtilsProcessor")
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
