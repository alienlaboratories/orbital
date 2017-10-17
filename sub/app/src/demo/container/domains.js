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

  static Renderer = (onChange) => (item, attrs) => {
    let { key, label, active=false } = attrs;

    console.log(key, attrs);

    const onToggle = (event) => {
      event.stopPropagation();                  // TODO(burdon): Prevents redraw? Prevent bubbling of click.
      onChange(key, !active);
    };

    return (
      <div className="orb-x-panel">
        <input type="checkbox" checked={ active } onClick={ onToggle }/>
        <div>{ label }</div>
      </div>
    );
  };

  handleCreate() {
    console.log('Create domain');
  }

  render() {
    let { domains, selectedDomain, domainStates, onSelect, onChange } = this.props;

    console.log('!!!!!!!!');

    const mapper = (item) => {
      let { uri, name:label } = item;
      let key = uri.replace('.', '_');          // TODO(burdon): Encode URI.
      let active = _.get(domainStates, key);
      return { key, label, active };
    };

    return (
      <div className="app-domains-panel">
        <div className="orb-x-panel">
          <h2 className="orb-expand">Domains</h2>
          <i className="orb-icon orb-icon-add" onClick={this.handleCreate.bind(this)}/>
        </div>

        <List className="app-domains-list"
              mapper={ mapper }
              renderer={ DomainsPanel.Renderer(onChange) }
              items={ domains }
              selectedItem={ selectedDomain }
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
