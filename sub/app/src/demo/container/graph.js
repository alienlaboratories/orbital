//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { Chance } from 'chance';

import { ID, ReduxUtil } from 'orbital-util';

import { Graph } from '../component/graph';
import { subscribe } from '../framework/subscription';
import { AppReducer } from '../reducer/app_reducer';

const chance = new Chance();

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

  ReduxUtil.connect({
    mapStateToProps: (state, ownProps) => {
      let { selectedItem } = AppReducer.state(state);

      return {
        selectedKey: selectedItem
      };
    }
  }),

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

          let mutations = [];

          // Create item.
          if (!target) {
            target = {
              type: source.type,
              id: ID.createId()
            };

            mutations.push({
              key: target,
              mutations: [
                {
                  field: 'title',
                  value: {
                    string: chance.name()
                  }
                }
              ]
            });
          }

          // Link item.
          mutations.push({
            key: source,
            mutations: [
              {
                field: 'items',
                value: {
                  set: [{
                    value: {
                      string: ID.encodeKey(target)
                    }
                  }]
                }
              }
            ]
          });

          mutate({
            variables: {
              batches: [
                {
                  mutations
                }
              ]
            }
          });
        },
      };
    }
  })

)(subscribe(Graph));
