/* eslint-disable css-modules/no-unused-or-extra-class */
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
/* Layout loads global libraries such as normalize and material design lite,
libraries imported from node_modules are not part of CSS Modules,
TODO: Use css-loader imports? therefore move this to Layout.css? */
import normalize from 'normalize.css';
import mdl from 'material-design-lite/material.css';
import s from './Layout.css';
import Header from '../Header/Header.js';
import Modal from '../Modal/Modal.js';
import Checkbox from '../Checkbox/Checkbox.js';

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  constructor() {
    super();

    this.state = {
      showModal: true,
    };

    this.onClose = this.onClose.bind(this);
  }

  onClose() {
    this.setState({ showModal: false });
  }

  render() {
    return (
      <div className={cx(s.page, s.container)}>
        <Header />
        <main className={cx(s.content, s.container)}>
          {this.props.children}
          <Modal title="Hello there" isOpen={this.state.showModal} onClose={this.onClose}>
            <Checkbox name="test" label="Show CAPE data" />
          </Modal>
        </main>
      </div>
    );
  }
}

export default withStyles(normalize, mdl, s)(Layout);
