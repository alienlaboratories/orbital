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

  // TODO(burdon): Util.
  static encodeUri(uri) {
    return uri.replace('.', '_');
  }

  // TODO(burdon): PropTypes.

  handleCreate() {
    console.log('Create domain');
  }

  render() {
    let { domains, domainStates, selectedDomain, onSelect, onChange } = this.props;

    const ListItem = ({ item, onClick }) => {
      let { uri, name } = item;

      let key = DomainsPanel.encodeUri(uri);
      let checked = _.get(domainStates, key, false);

      return (
        <div className="orb-x-panel">
          <input type="checkbox" checked={ checked } onChange={ () => { onChange(key, !checked); } }/>
          <div onClick={ onClick }>{ name }</div>
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
              keyMapper={ ({ uri }) => DomainsPanel.encodeUri(uri) }
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
      let { selectedDomain, domainStates } = AppReducer.state(state);

      return {
        selectedDomain, domainStates
      };
    },

    mapDispatchToProps: (dispatch, ownProps) => {
      return {
        onChange: (key, state) => {
          dispatch(AppReducer.setDomainState(key, state));
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
