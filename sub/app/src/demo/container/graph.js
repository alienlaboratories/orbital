//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { ID } from 'orbital-util';

import { Graph } from '../component/graph';
import { subscribe } from './subscription';

// TODO(burdon): Factor out query.
const GraphQuery = gql`
  query GraphQuery($query: QueryInput!) {
    result: query(query: $query) {
      items {
        key {
          type
          id
        }
        title
        items {
          key {
            type
            id
          }
        }
      }
    }
  }
`;

const UpdateMutation = gql`
  mutation UpdateMutation($batches: [BatchInput]!) {
    result: update(batches: $batches) {
      items {
        key {
          type
          id
        }
        title
        items {
          key {
            type
            id
          }
        }
      }
    }
  }
`;

export const GraphContainer = compose(

  graphql(GraphQuery, {

    options: (props) => {
      let { pollInterval } = props;
      return {
        variables: {
          query: {}
        },
        pollInterval
      };
    },

    props: ({ ownProps, data }) => {
      let { errors, loading, refetch, result={} } = data;
      let { items=[] } = result;

      return {
        errors, loading, refetch, items
      };
    }
  }),

  graphql(UpdateMutation, {

    props: ({ ownProps, mutate }) => {
      return {
        onDrop: (event) => {
          console.log('DROP', JSON.stringify(event));

          let { source, target } = event;
          if (source === target) {
            return;
          }

          // TODO(burdon): Create.
          if (!target) {
            return;
          }

          mutate({
            variables: {
              batches: [
                {
                  mutations: [
                    {
                      key: source,
                      mutations: [
                        {
                          field: 'items',
                          value: {
                            set: {
                              value: {
                                string: ID.encodeKey(target)
                              }
                            }
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          });
        },
      };
    }
  })

)(subscribe(Graph));
