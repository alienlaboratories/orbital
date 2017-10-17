//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { ID, ReduxUtil } from 'orbital-util';

import { Editor } from '../component/editor';
import { AppReducer } from '../reducer/app_reducer';

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
      }
    }
  }
`;

export const EditorContainer = compose(

  ReduxUtil.connect({
    mapStateToProps: (state, ownProps) => {
      let { selectedDomain } = AppReducer.state(state);

      return {
        selectedDomain
      };
    }
  }),

  // http://dev.apollodata.com/react/mutations.html
  graphql(UpdateMutation, {

    props: ({ ownProps, mutate }) => {
      let { selectedDomain } = ownProps;

      return {

        // TODO(burdon): Link?
        createItem: (title) => {

          // TODO(burdon): Update query (add to query results).
          // TODO(burdon): Optimistic update.
          mutate({
            variables: {
              batches: [
                {
                  domain: selectedDomain,
                  mutations: [
                    {
                      key: {
                        type: 'test',
                        id: ID.createId()
                      },
                      mutations: [
                        {
                          field: 'title',
                          value: {
                            string: title
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
  }
))(Editor);
