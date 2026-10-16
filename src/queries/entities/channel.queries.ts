import { gql } from "graphql-modules";

export const channelQueries = gql`
  fragment minimalChannel on Channel {
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
        key
      }
    }
    ...minimalBaseEntity
  }

  fragment fullChannel on Channel {
    intialValues {
      name: keyValue(key: "name", source: metadata)
    }
    relationValues
    entityView {
      column {
        size(size: seventy)
        elements {
          channels: entityListElement {
            label(input: "element-labels.channel-element")
            isCollapsed(input: false)
            entityTypes(input: [channel])
            customQuery(input: "GetEntities")
            customQueryFilters(input: "GetChannelFilter")
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
              label(input: "panel-labels.channel-info")
              isCollapsed(input: false)
              isEditable(input: false)
              name: metaData {
                key
              }
            }
          }
        }
      }
    }
  }

  fragment channelSortOptions on Channel {
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

  fragment filtersForChannel on Channel {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "channel")
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

  query GetChannelFilter($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type: advancedFilter(type: type) {
          type
          defaultValue(value: "channel")
          hidden(value: true)
        }
        relation: advancedFilter(
          type: selection
          key: ["elody:1|identifiers"]
        ) {
          type
          key
          defaultValue(value: "$entity.relationValues.isChannelFor.key")
          hidden(value: true)
        }
      }
    }
  }
`;
