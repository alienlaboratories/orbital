//
// Copyright 2017 Alien Labs.
//

import React from 'react';

/**
 *
 */
export class Editor extends React.Component {

  state = {
    text: ''
  };

  componentDidMount() {
    this._input.focus();
  }

  handleCreate() {
    let { text } = this.state;
    console.log('Create:', text);
    this.setState({
      text: ''
    }, () => {
      this._input.focus();
    });
  }

  handleTextChange(event) {
    this.setState({
      text: event.target.value
    });
  }

  handleKeyDown(event) {
    switch (event.keyCode) {
      case 13: {
        this.handleCreate();
        break;
      }
    }
  }

  render() {
    let { text } = this.state;
    return (
      <div className="orb-toolbar">
        <input type="text" className="orb-expand" value={text}
               onChange={this.handleTextChange.bind(this)}
               onKeyDown={this.handleKeyDown.bind(this)}
               ref={node => this._input = node}/>
        <button onClick={this.handleCreate.bind(this)}>Create</button>
      </div>
    );
  }
}