/* eslint-disable css-modules/no-unused-or-extra-class */
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import normalize from 'normalize.css';
import mdl from 'material-design-lite/material.css';
import s from './Layout.css';
import Header from '../Header/Header.js';

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    return (
      <div className={cx(s.page, s.container)}>
        <Header />
        <main className={cx(s.content, s.container)}>
          {this.props.children}
        </main>
      </div>
    );
  }
}

export default withStyles(normalize, mdl, s)(Layout);
