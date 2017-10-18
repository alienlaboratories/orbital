//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { ReduxUtil } from 'orbital-ux';

import { List } from '../component/list';
import { subscribe } from '../framework/subscription';
import { AppReducer } from '../reducer/app_reducer';

// TODO(burdon): Factor out query.
const NodeQuery = gql`
  query NodeQuery($query: QueryInput!) {
    result: query(query: $query) {
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

export const ListContainer = compose(

  ReduxUtil.connect({
    mapStateToProps: (state, ownProps) => {
      let { activeDomains, selectedItem } = AppReducer.state(state);

      return {
        activeDomains,
        selectedKey: selectedItem
      };
    },

    mapDispatchToProps: (dispatch, ownProps) => {
      return {
        onSelect: (key) => {
          dispatch(AppReducer.selectItem(key));
        }
      };
    }
  }),

  graphql(NodeQuery, {
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
      let { items } = result;

      // TODO(burdon): Util to wrap standard data params.
      return {
        errors, loading, refetch, items
      };
    }
  }

))(subscribe(List));
