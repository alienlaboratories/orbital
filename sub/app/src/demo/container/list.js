//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { List } from '../component/list';
import { subscribe } from './subscription';

// TODO(burdon): Factor out query.
const NodeQuery = gql`
  query NodeQuery($query: Query!) {
    result: query(query: $query) {
      nodes {
        type
        id
        title
      }
    }
  }
`;

export const ListContainer = compose(
  graphql(NodeQuery, {
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

      // TODO(burdon): Util to wrap standard data params.
      return {
        errors, loading, refetch, result
      };
    }
  }
))(subscribe(List));
