/* eslint-disable css-modules/no-unused-or-extra-class */
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Layout.css';
import Header from '../Header/Header.js';

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    return (
      <div className={cx(s['mdl-layout'])}>
        <Header />
        <main className={cx(s['mdl-layout__content'], s.content)}>
          {this.props.children}
        </main>
      </div>
    );
  }
}

export default withStyles(s)(Layout);
