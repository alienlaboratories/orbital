//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { ID } from 'orbital-util';

import { Editor } from '../component/editor';

const UpdateMutation = gql`
  mutation UpdateMutation($batches: [BatchInput]!) {
    result: update(batches: $batches) {
      items {
        type
        id
        title
      }
    }
  }
`;

export const EditorContainer = compose(

  // http://dev.apollodata.com/react/mutations.html
  graphql(UpdateMutation, {

    props: ({ ownProps, mutate }) => {
      return {

        // TODO(burdon): Link.
        createItem: (title) => {

          // TODO(burdon): Update query (add to query results).
          // TODO(burdon): Optimistic update.
          mutate({
            variables: {
              batches: [
                {
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
