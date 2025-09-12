import { gql } from "graphql-modules";

export const tenant = gql`
  fragment minimalTenant on Tenant {
    ...minimalBaseEntity
    intialValues {
      id: keyValue(key: "_id", source: root)
      label: keyValue(key: "label", source: metadata)
    }
    teaserMetadata {
      label: metaData {
        label(input: "metadata.labels.name")
        key(input: "label")
      }
    }
  }

  fragment fullTenant on Tenant {
    intialValues {
      id: keyValue(key: "_id", source: root)
      name: keyValue(key: "label", source: metadata)
      title: keyValue(key: "label", source: metadata)
    }
    entityView {
      column {
        size(size: seventy)
        elements {
          windowElement {
            label(input: "window-element-labels.info-window")
            expandButtonOptions {
              shown(input: true)
            }
            roleInfo: panels {
              label(input: "panel-labels.role-info")
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: true)
              name: metaData {
                label(input: "metadata.labels.name")
                key(input: "name")
                inputField(type: baseTextField) {
                  ...inputfield
                }
              }
            }
          }
        }
      }
    }
  }

  fragment tenantSortOptions on Tenant {
    sortOptions {
      options(
        input: [{ icon: NoIcon, label: "metadata.labels.name", value: "label" }]
      ) {
        icon
        label
        value
      }
    }
  }

  fragment tenantFilters on Tenant {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "tenant")
        hidden(value: true)
      }
      relation: advancedFilter(
        type: selection
        parentKey: "relations"
        key: "isTenantFor"
      ) {
        type
        parentKey
        key
        tooltip(value: true)
        defaultValue(value: [])
        hidden(value: true)
      }
    }
  }
`;
