//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { Graph } from '../component/graph';

// TODO(burdon): Contact network from email service.
// TODO(burdon): Extract text from email messages. Topics.

const GraphQuery = gql`
  query GraphQuery($query: Query!) {
    result: query(query: $query) {
      nodes {
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
