import { gql } from "graphql-modules";

export const processorQueries = gql`
  query GetRelatedProcessorFilter($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: type) {
          type
          defaultValue(value: "githubProcessor")
          hidden(value: true)
        }
        # Server-side "components of this pipeline": the store reads the
        # pipeline's hasProcessor relations itself. Filtering on the client's
        # cached relationValues made a freshly added component vanish from the
        # panel until the parent entity was refetched.
        relation: advancedFilter(
          type: selection
          key: ["related_to_pipeline"]
        ) {
          type
          key
          defaultValue(value: "$parentIds")
          hidden(value: true)
        }
      }
    }
  }

  query GetRunnerRelatedToProcessorFilter($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: type) {
          type
          defaultValue(value: ["jsRunner", "jvmRunner", "pyRunner"])
          hidden(value: true)
        }
        relation: advancedFilter(
          type: selection
          key: ["elody:1|identifiers"]
        ) {
          type
          key
          defaultValue(value: "$entity.relationValues.isProcessorFor.key")
          hidden(value: true)
        }
      }
    }
  }

  query GetRunnerOnProcessorBulkOperations {
    CustomBulkOperations {
      bulkOperationOptions {
        options(
          input: [
            {
              icon: PlusCircle
              label: "bulk-operations.create-jsrunner"
              value: "createEntity"
              can: ["update:githubProcessor:has-runner"]
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
              label: "bulk-operations.create-jvmrunner"
              value: "createEntity"
              can: ["update:githubProcessor:has-runner"]
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
              label: "bulk-operations.create-pyrunner"
              value: "createEntity"
              can: ["update:githubProcessor:has-runner"]
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
              can: ["update:githubProcessor:has-runner"]
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
              can: ["update:githubProcessor:has-runner"]
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
