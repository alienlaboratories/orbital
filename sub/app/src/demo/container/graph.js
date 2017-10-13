//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { Graph } from '../component/graph';
import { subscribe } from './subscription';

// TODO(burdon): Factor out query.
const GraphQuery = gql`
  query GraphQuery($query: QueryInput!) {
    result: query(query: $query) {
      items {
        type
        id
        title
        items {
          id
        }
      }
    }
  }
`;

const UpdateMutation = gql`
  mutation UpdateMutation($batches: [BatchInput]!) {
    result: update(batches: $batches) {
      items {
        type
        id
        title
        items {
          id
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
                      key: {
                        type: 'test',             // TODO(burdon): FIX.
                        id: source
                      },
                      mutations: [
                        {
                          field: 'items',
                          value: {
                            set: {
                              value: {
                                string: target
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
