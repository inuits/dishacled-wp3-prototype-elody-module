import { gql } from "graphql-modules";

export const user = gql`
  fragment minimalUser on User {
    intialValues {
      email: keyValue(key: "email", source: metadata)
      slug: keyValue(key: "id", source: root)
    }
    allowedViewModes {
      viewModes(input: [
        { viewMode: ViewModesList }
      ]) {
        ...viewModes
      }
    }
    teaserMetadata {
      email: metaData {
        label(input: "metadata.labels.email")
        key(input: "email")
      }
    }
    ...minimalBaseEntity
  }

  fragment fullUser on User {
    intialValues {
      email: keyValue(key: "email", source: metadata)
      first_name: keyValue(key: "first_name", source: metadata)
      hasTenant: keyValue(key: "hasTenant", source: metadata)
      last_name: keyValue(key: "last_name", source: metadata)
      title: keyValue(key: "email", source: metadata)
    }
    relationValues
    entityView {
      column {
        size(size: seventy)
        elements {
          windowElement {
            label(input: "window-element-labels.info-window")
            expandButtonOptions {
              shown(input: true)
            }
            userInfo: panels {
              label(input: "panel-labels.user-panel")
              panelType(input: metadata)
              isCollapsed(input: false)
              isEditable(input: true)
              first_name: metaData {
                label(input: "metadata.labels.firstName")
                key(input: "first_name")
                inputField(type: baseTextField) {
                  ...inputfield
                }
              }
              last_name: metaData {
                label(input: "metadata.labels.lastName")
                key(input: "last_name")
                inputField(type: baseTextField) {
                  ...inputfield
                }
              }
              email: metaData {
                label(input: "metadata.labels.email")
                key(input: "email")
              }
            }
          }
        }
      }
    }
  }

  fragment filtersForUser on User {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "user")
        hidden(value: true)
      }
      email: advancedFilter(
        type: text
        key: ["elody:1|metadata.email.value"]
        label: "metadata.labels.email"
        isDisplayedByDefault: true
      ) {
        type
        key
        label
        isDisplayedByDefault
        tooltip(value: true)
      }
      firstName: advancedFilter(
        type: text
        key: ["elody:1|metadata.first_name.value"]
        label: "metadata.labels.firstName"
        isDisplayedByDefault: true
      ) {
        type
        key
        label
        isDisplayedByDefault
        tooltip(value: true)
      }
      lastName: advancedFilter(
        type: text
        key: ["elody:1|metadata.last_name.value"]
        label: "metadata.labels.lastName"
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

  fragment userSortOptions on User {
    sortOptions {
      options(
        input: [
          { icon: NoIcon, label: "metadata.labels.user.name", value: "name" }
          { icon: NoIcon, label: "metadata.labels.user.email", value: "email" }
        ]
      ) {
        icon
        label
        value
      }
      isAsc(input: asc)
    }
  }
`;
