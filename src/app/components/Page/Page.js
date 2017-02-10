import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Page.css';

class Page extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    html: PropTypes.string.isRequired,
  };

  render() {
    const { title, html } = this.props;
    return (
      <div className={s.root}>
        <div className={s.container}>
          {title && <h1>{title}</h1>}
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Page);
