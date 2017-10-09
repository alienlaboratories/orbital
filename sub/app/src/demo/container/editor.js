//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { ID } from 'orbital-util';

import { Editor } from '../component/editor';

const NodeMutation = gql`
  mutation UpdateMutation($batches: [Batch]!) {
    result: update(batches: $batches) {
      nodes {
        id
        title
      }
    }
  }
`;

export const EditorContainer = compose(

  // http://dev.apollodata.com/react/mutations.html
  graphql(NodeMutation, {

    props: ({ ownProps, mutate }) => {
      return {
        createItem: (title) => {

          // TODO(burdon): Update cache.
          mutate({
            variables: {
              batches: [
                {
                  mutations: [
                    {
                      id: ID.createId(),
                      mutations: [
                        {
                          key: 'title',
                          value: title
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          });
        }
      };
    }
  }
))(Editor);
