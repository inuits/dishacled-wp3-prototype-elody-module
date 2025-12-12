import { gql } from "graphql-modules";

export const jvmRmlProcessorQueries = gql`
  fragment minimalJvmRmlProcessor on JvmRmlProcessor {
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

  fragment fullJvmRmlProcessor on JvmRmlProcessor {
    intialValues {
      name: keyValue(key: "name", source: metadata)
      mappings: keyValue(key: "mappings", source: metadata)
      baseIRI: keyValue(key: "baseIRI", source: metadata)
      waitForMappingClose: keyValue(
        key: "waitForMappingClose"
        source: metadata
      )
      defaultTarget: keyValue(key: "defaultTarget", source: metadata)
      sources: keyValue(key: "sources", source: metadata)
      targets: keyValue(key: "targets", source: metadata)
    }
    relationValues
    entityView {
      column {
        size(size: seventy)
        elements {
          runners: entityListElement {
            label(input: "element-labels.runner-element")
            isCollapsed(input: false)
            entityTypes(input: [jvmRunner])
            relationType: label(input: "hasRunner")
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetRunnerRelatedToProcessorFilter")
            searchInputType(input: "AdvancedInputType")
            customBulkOperations(
              input: "GetRunnerOnJvmRmlProcessorBulkOperations"
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
            mappingsPanel: panels {
              label(input: "panel-labels.mappings")
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: true)
              mappings: metaData {
                label(input: "metadata.labels.mappings")
                key(input: "mappings")
                inputField(type: baseTextField) {
                  ...inputfield
                  validation(input: { value: required }) {
                    ...validation
                  }
                }
              }
              baseIRI: metaData {
                label(input: "metadata.labels.base-iri")
                key(input: "baseIRI")
                inputField(type: baseTextField) {
                  ...inputfield
                }
              }
              waitForMappingClose: metaData {
                label(input: "metadata.labels.wait-for-mapping-close")
                key(input: "waitForMappingClose")
                inputField(type: baseCheckbox) {
                  ...inputfield
                }
              }
              defaultTarget: metaData {
                label(input: "metadata.labels.default-target")
                key(input: "defaultTarget")
              }
            }
            sourcesPanel: panels {
              label(input: "panel-labels.sources")
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: true)
              sources: metaData {
                label(input: "metadata.labels.sources")
                key(input: "sources")
              }
            }
            targetsPanel: panels {
              label(input: "panel-labels.targets")
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: true)
              targets: metaData {
                label(input: "metadata.labels.targets")
                key(input: "targets")
              }
            }
          }
        }
      }
    }
  }

  fragment jvmRmlProcessorSortOptions on JvmRmlProcessor {
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

  fragment filtersForJvmRmlProcessor on JvmRmlProcessor {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "jvmRmlProcessor")
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

  fragment jvmRmlProcessorBulkOperations on JvmRmlProcessor {
    bulkOperationOptions {
      options(
        input: [
          {
            icon: Create
            label: "bulk-operations.create-jvm-rml-processor"
            value: "createEntity"
            primary: true
            actionContext: {
              activeViewMode: readMode
              entitiesSelectionType: noneSelected
              labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
            }
            bulkOperationModal: {
              typeModal: DynamicForm
              formQuery: "GetJvmRmlProcessorCreateForm"
              formRelationType: "isJvmRmlProcessorFor"
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

  query GetJvmRmlProcessorCreateForm {
    GetDynamicForm {
      label(input: "navigation.create-jvm-rml-processor")
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
            creationType(input: jvmRmlProcessor)
            showsFormErrors(input: true)
          }
        }
      }
    }
  }

  query GetRunnerOnJvmRmlProcessorBulkOperations {
    CustomBulkOperations {
      bulkOperationOptions {
        options(
          input: [
            {
              icon: PlusCircle
              label: "bulk-operations.create-jvmrunner"
              value: "createEntity"
              can: ["update:jvmRmlProcessor:has-runner"]
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
              icon: PlusCircle
              label: "bulk-operations.existing-runner"
              value: "addRelation"
              can: ["update:jvmRmlProcessor:has-runner"]
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
              can: ["update:jvmRmlProcessor:has-runner"]
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

  query GetJvmRmlProcessorFilter($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: type) {
          type
          defaultValue(value: "jvmRmlProcessor")
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
