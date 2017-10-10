//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { Graph } from '../component/graph';

// TODO(burdon): Factor out query.
const GraphQuery = gql`
  query GraphQuery($query: Query!) {
    result: query(query: $query) {
      nodes {
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
    let { nodes=[] } = result;

    return {
      errors, loading, nodes
    };
  }

}))(Graph);
