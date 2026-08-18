import { gql } from "graphql-modules";

// Demonstrator alerts (oslc:Error), read live from the SPARQL error graph.
//
// The detail view deliberately does NOT enumerate fields: `shapeFields` carries
// the field set derived from lblodsh:ErrorShape with this alert's values merged
// in, and `shaclShapeElement` renders it. Adding a property to the shape makes
// it appear here with no change to this file -- that is the point of A2.
export const alertQueries = gql`
  fragment minimalAlert on Alert {
    intialValues {
      message: keyValue(key: "message", source: metadata)
      created: keyValue(key: "created", source: metadata)
      subject: keyValue(key: "subject", source: metadata)
    }
    relationValues
    allowedViewModes {
      viewModes(input: [{ viewMode: ViewModesList }]) {
        ...viewModes
      }
    }
    teaserMetadata {
      message: metaData {
        label(input: "metadata.labels.alert.message")
        key(input: "message")
        colSpan(input: "2")
      }
      created: metaData {
        label(input: "metadata.labels.alert.created")
        key(input: "created")
        unit(input: DATETIME_DMY24)
      }
      subject: metaData {
        label(input: "metadata.labels.alert.subject")
        key(input: "subject")
      }
    }
    ...minimalBaseEntity
  }

  fragment fullAlert on Alert {
    shapeFields
    # Entity scaffolding, not the form: EntitySingle refuses to render an entity
    # without intialValues, and the breadcrumb needs something to title the page.
    # The fields on the page still come entirely from shapeFields.
    intialValues {
      message: keyValue(key: "message", source: metadata)
      uuid: keyValue(key: "uuid", source: metadata)
    }
    relationValues
    entityView {
      column {
        size(size: hundred)
        elements {
          shaclShapeElement {
            label(input: "panel-labels.alert-shape")
            fieldsKey(input: "shapeFields")
            isCollapsed(input: false)
          }
        }
      }
    }
  }

  fragment alertSortOptions on Alert {
    sortOptions {
      options(
        input: [
          {
            icon: NoIcon
            label: "metadata.labels.alert.created"
            value: "created"
          }
        ]
      ) {
        icon
        label
        value
      }
      isAsc(input: desc)
    }
  }

  fragment filtersForAlert on Alert {
    advancedFilters {
      type: advancedFilter(type: type) {
        type
        defaultValue(value: "alert")
        hidden(value: true)
      }
    }
  }

  fragment alertBulkOperations on Alert {
    bulkOperationOptions {
      options(input: []) {
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

  query GetAlertEntities(
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
        ... on Alert {
          ...minimalAlert
        }
      }
    }
  }

`;
