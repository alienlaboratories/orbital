//
// Copyright 2017 Alien Labs.
//

import React from 'react';

/**
 *
 */
export class DomainsPanel extends React.Component {

  handleCreate() {
    console.log('Create domain');
  }

  render() {
    return (
      <div className="orb-domains-panel">
        <div className="orb-x-panel">
          <h2 className="orb-expand">Domains</h2>
          <i className="orb-icon orb-icon-add" onClick={this.handleCreate.bind(this)}/>
        </div>
      </div>
    );
  }
}