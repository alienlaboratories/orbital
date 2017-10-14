//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { ReduxUtil } from 'orbital-util';

import { List } from '../component/list';
import { subscribe } from './subscription';
import { AppReducer } from '../reducer/app_reducer';

// TODO(burdon): Factor out query.
const NodeQuery = gql`
  query NodeQuery($query: QueryInput!) {
    result: query(query: $query) {
      items {
        key {
          type
          id
        }
        title
      }
    }
  }
`;


export const ListContainer = compose(

  ReduxUtil.connect({
    mapStateToProps: (state, ownProps) => {
      let { selectedItem } = AppReducer.state(state);

      return {
        selectedItem
      };
    },

    mapDispatchToProps: (dispatch, ownProps) => {
      return {
        selectItem: (key) => {
          dispatch(AppReducer.selectItem(key));
        }
      };
    }
  }),

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
