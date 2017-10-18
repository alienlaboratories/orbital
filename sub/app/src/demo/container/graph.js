//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { Chance } from 'chance';

import { ID } from 'orbital-util';
import { ReduxUtil } from 'orbital-ux';

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
          domain
          type
          id
        }
        title
        items {
          key {
            domain
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
          domain
          type
          id
        }
        title
        items {
          key {
            domain
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
      let { activeDomains, selectedDomain, selectedItem } = AppReducer.state(state);

      return {
        activeDomains,
        selectedDomain,
        selectedKey: selectedItem
      };
    }
  }),

  graphql(GraphQuery, {

    options: (props) => {
      let { activeDomains, pollInterval } = props;
      return {
        variables: {
          query: {
            domains: activeDomains
          }
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
      let { selectedDomain } = ownProps;

      return {
        onDrop: (event) => {
          let { source, target } = event;
          if (source === target) {
            return;
          }

          if (source.domain !== selectedDomain) {
            console.warn('Invalid domain');
            return;
          }

          if (target && source.domain !== target.domain) {
            console.warn('Unmatched domains:', source.domain, target.domain);
            return;
          }

          let mutations = [];

          // Create item.
          if (!target) {
            target = {
              domain: source.domain,
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
                  domain: selectedDomain,
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
