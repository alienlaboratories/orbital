//
// Copyright 2017 Alien Labs.
//

import React from 'react';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { ReduxUtil } from 'orbital-util';

import { subscribe } from '../framework/subscription';
import { AppReducer } from '../reducer/app_reducer';
import { List } from '../component/list';

/**
 * Domains list panel.
 */
export class DomainsPanel extends React.Component {

  // TODO(burdon): PropTypes.

  handleCreate() {
    console.log('Create domain');
  }

  render() {
    let { domains, activeDomains, selectedDomain, onSelect, onChange } = this.props;

    const ListItem = ({ item, onClick }) => {
      let { uri, name } = item;

      let checked = _.indexOf(activeDomains, uri) !== -1;

      return (
        <div className="orb-x-panel">
          <input type="checkbox" checked={ checked } onChange={ () => { onChange(uri, !checked); } }/>
          <div className="orb-expand" onClick={ onClick }>{ name }</div>
        </div>
      );
    };

    return (
      <div className="app-domains-panel">
        <div className="orb-x-panel">
          <h2 className="orb-expand">Domains</h2>
          <i className="orb-icon orb-icon-add" onClick={ this.handleCreate.bind(this) }/>
        </div>

        <List className="app-domains-list"
              keyMapper={ ({ uri }) => uri }
              renderer={ ListItem }
              items={ domains }
              selectedKey={ selectedDomain }
              onSelect={ onSelect }/>
      </div>
    );
  }
}

const DomainsQuery = gql`
  query DomainsQuery {
    domains {
      uri
      name
    }
  }
`;

export const DomainsContainer = compose(

  ReduxUtil.connect({
    mapStateToProps: (state, ownProps) => {
      let { selectedDomain, activeDomains } = AppReducer.state(state);

      return {
        selectedDomain, activeDomains
      };
    },

    mapDispatchToProps: (dispatch, ownProps) => {
      return {
        onChange: (key, active) => {
          dispatch(AppReducer.selectedActive(key, active));
        },
        onSelect: (key) => {
          dispatch(AppReducer.selectDomain(key));
        }
      };
    }
  }),

  graphql(DomainsQuery, {
    options: (props) => {
      let { pollInterval } = props;
      return {
        variables: {},
        pollInterval
      };
    },

    props: ({ ownProps, data }) => {
      let { errors, loading, refetch, domains=[] } = data;

      return {
        errors, loading, refetch, domains
      };
    }
  }

))(subscribe(DomainsPanel));
