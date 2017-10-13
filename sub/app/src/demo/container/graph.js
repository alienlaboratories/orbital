//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { Graph } from '../component/graph';

// TODO(burdon): Factor out query.
const GraphQuery = gql`
  query GraphQuery($query: QueryInput!) {
    result: query(query: $query) {
      items {
        type
        id
        title
      }
    }
  }
`;

export const GraphContainer = compose(graphql(GraphQuery, {

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
    let { errors, loading, result={} } = data;
    let { items=[] } = result;

    return {
      errors, loading, items
    };
  }

}))(Graph);
