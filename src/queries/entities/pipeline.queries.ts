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
    # the pipeline's producer->consumer links as directed, typed edges, each
    # carrying the verdict of the last chain validation
    pipelineConnections
    # whether every link's producer output shape is acceptable to the consumer
    # it feeds, with the structured violation list when it is not
    pipelineValidation
    entityView {
      # One full-width column: the pipeline info on top, the components
      # (with the pipeline view mode canvas) full-width below it.
      column {
        size(size: hundred)
        elements {
          windowElement {
            label(input: "window-element-labels.info-window")
            expandButtonOptions {
              shown(input: true)
            }
            info: panels {
              panelHeaderContent(panelHeaderContentInput: { label: "panel-labels.pipeline-info" }) {
                label
              }
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
          # No runners panel: in the logical model the runner is a build
          # detail — the exports derive it from each processor's runtime
          # metadata (NodeRunner by default, see pipeline_ttl_serializer.py).
          processors: entityListElement {
            label(input: "element-labels.processor-element")
            isCollapsed(input: false)
            entityTypes(input: [githubProcessor])
            relationType: label(input: "hasProcessor")
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetRelatedProcessorFilter")
            searchInputType(input: "AdvancedInputType")
            customBulkOperations(input: "GetProcessorOnPipelineOperations")
            customQueryEntityPickerList(
              input: "GetEntityPickerListForProcessorsInPipeline"
            )
            customQueryEntityPickerListFilters(
              input: "GetEntityPickerFiltersForProcessorsInPipeline"
            )
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
              formQueries: ["GetPipelineCreateForm"]
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

  # Direct fetch of a pipeline's connections, for callers that hold only the
  # pipeline id (validation reporting, export previews).
  query GetPipelineConnections($id: String!) {
    PipelineConnections(id: $id)
  }

  # The chain-validation report for one pipeline. Callers that already hold the
  # pipeline get it from the fullPipeline fragment; this exists for the ones
  # that only hold an id (export previews, a validation panel refresh).
  query GetPipelineValidation($id: String!) {
    PipelineValidation(id: $id)
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
              label: "bulk-operations.create-jsrunner"
              value: "createEntity"
              can: ["update:pipeline:has-runner"]
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQueries: ["GetJsRunnerCreateForm"]
                formRelationType: "isRunnerFor"
                askForCloseConfirmation: true
                neededPermission: cancreate
              }
            }
            {
              icon: PlusCircle
              label: "bulk-operations.create-jvmrunner"
              value: "createEntity"
              can: ["update:pipeline:has-runner"]
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQueries: ["GetJvmRunnerCreateForm"]
                formRelationType: "isRunnerFor"
                askForCloseConfirmation: true
                neededPermission: cancreate
              }
            }
            {
              icon: PlusCircle
              label: "bulk-operations.create-pyrunner"
              value: "createEntity"
              can: ["update:pipeline:has-runner"]
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQueries: ["GetPyRunnerCreateForm"]
                formRelationType: "isRunnerFor"
                askForCloseConfirmation: true
                neededPermission: cancreate
              }
            }
            {
              icon: PlusCircle
              label: "bulk-operations.existing-runner"
              value: "addRelation"
              can: ["update:pipeline:has-runner"]
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQueries: ["GetEntityPickerForm"]
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
                formQueries: ["GetBulkRemovingMediafilesInDetailForm"]
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

  # Guided add-component flow: pick a component from the catalog in a stepper
  # and attach it to the pipeline the flow was opened from (finalizeOnHost).
  # PoC scope: one picker step; the configure and connect steps follow once
  # this proves out (see the guided-pipeline-composition notes).
  query GetRepetitiveFormForComponent {
    GetRepetitiveForm {
      label(input: "repetitiveForm.add-component-title")
      repeatable(input: true)
      # deliberately NOT linear: a linear flow with finalizeOnHost commits and
      # closes after the last step, skipping the overview with "add another"
      refetchOnFinish(input: true)
      component: steps {
        key(input: "component")
        label(input: "repetitiveForm.step-component")
        entityType(input: "githubProcessor")
        createForm(input: "GetPipelineCreateForm")
        pickerQuery(input: "GetEntityPickerListForProcessorsInPipeline")
        pickerFiltersQuery(input: "GetEntityPickerFiltersForProcessorsInPipeline")
        acceptedTypes(input: ["githubProcessor"])
        maxSelection(input: 1)
        overviewFields(
          input: [
            { key: "name", label: "metadata.labels.name" }
            { key: "description", label: "metadata.labels.description" }
          ]
        ) {
          key
          label
        }
      }
      finalizeOnHost {
        fromStep(input: "component")
        relationType(input: "hasProcessor")
      }
    }
  }

  query GetProcessorOnPipelineOperations {
    CustomBulkOperations {
      bulkOperationOptions {
        options(
          input: [
            {
              icon: PlusCircle
              label: "bulk-operations.add-processor"
              value: "addRelation"
              can: ["update:pipeline:has-processor"]
              actionContext: {
                activeViewMode: readMode
                entitiesSelectionType: noneSelected
                labelForTooltip: "tooltip.bulkOperationsActionBar.readmode-noneselected"
              }
              bulkOperationModal: {
                typeModal: DynamicForm
                formQueries: ["GetEntityPickerForm"]
                askForCloseConfirmation: true
                neededPermission: canupdate
                # components already in the pipeline are greyed out in the
                # picker, so it reads as "already used". A component CAN be
                # used twice in the toolchain model (two loggers in the
                # tutorial pipeline), but that is the exception -- when it
                # comes up, allowDuplicateRelations: true turns it back on.
              }
            }
            {
              label: "bulk-operations.delete-selected"
              value: "deleteEntities"
              primary: false
              can: ["update:pipeline:has-processor"]
              bulkOperationModal: {
                typeModal: BulkOperationsDeleteEntities
                formQueries: ["GetBulkRemovingMediafilesInDetailForm"]
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

  query GetEntityPickerListForRunnersInPipeline(
    $type: Entitytyping!
    $limit: Int
    $skip: Int
    $searchValue: SearchFilter!
    $advancedSearchValue: [FilterInput]
    $advancedFilterInputs: [AdvancedFilterInput!]!
    $searchInputType: SearchInputType
  ) {
    Entities(
      type: $type
      limit: $limit
      skip: $skip
      searchValue: $searchValue
      advancedSearchValue: $advancedSearchValue
      advancedFilterInputs: $advancedFilterInputs
      searchInputType: $searchInputType
    ) {
      count
      limit
      results {
        id
        uuid
        type
        ... on JsRunner {
          ...minimalJsRunner
        }
        ... on PyRunner {
          ...minimalPyRunner
        }
        ... on JvmRunner {
          ...minimalJvmRunner
        }
      }
      __typename
    }
  }

  query GetEntityPickerFiltersForRunnersInPipeline($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: selection, key: "type") {
          type
          key
          defaultValue(value: ["jsRunner", "pyRunner", "jvmRunner"])
          hidden(value: true)
        }
      }
    }
  }

  query GetEntityPickerListForProcessorsInPipeline(
    $type: Entitytyping!
    $limit: Int
    $skip: Int
    $searchValue: SearchFilter!
    $advancedSearchValue: [FilterInput]
    $advancedFilterInputs: [AdvancedFilterInput!]!
    $searchInputType: SearchInputType
  ) {
    Entities(
      type: $type
      limit: $limit
      skip: $skip
      searchValue: $searchValue
      advancedSearchValue: $advancedSearchValue
      advancedFilterInputs: $advancedFilterInputs
      searchInputType: $searchInputType
    ) {
      count
      limit
      results {
        id
        uuid
        type
        ... on GithubProcessor {
          ...minimalGithubProcessor
        }
      }
      __typename
    }
  }

  query GetEntityPickerFiltersForProcessorsInPipeline($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: type) {
          type
          defaultValue(value: "githubProcessor")
          hidden(value: true)
        }
        # Shape-guided suggestions: carries the pipeline id ($parentIds — the
        # one variable the picker-filter context reliably has); the backend
        # reads the pipeline's chain tail and keeps only the components whose
        # input shape matches its output shape. Typing a search term lifts the
        # filter, so incompatible components stay reachable on purpose.
        suggestion: advancedFilter(type: selection, key: ["suggest_for_pipeline"]) {
          type
          key
          defaultValue(value: "$parentIds")
          hidden(value: true)
        }
        # the "+" on an output port fills $portShapeIris with that port's
        # shape IRIs; opened any other way the variable stays unresolved and
        # the store ignores the empty filter
        shapeScope: advancedFilter(type: selection, key: ["suggest_for_shape"]) {
          type
          key
          defaultValue(value: "$portShapeIris")
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
  }
`;
