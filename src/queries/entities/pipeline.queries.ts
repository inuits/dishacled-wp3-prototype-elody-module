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
      serial_number: metaData {
        label(input: "metadata.labels.name")
        key(input: "name")
      }
    }
    ...minimalBaseEntity
  }

  fragment fullPipeline on Pipeline {
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
            entityTypes(input: [runner])
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetRunnerFilter")
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
              label(input: "panel-labels.pipeline-info")
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

  query GetRunnerFilter($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: type) {
          type
          defaultValue(value: "runner")
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
