import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import style from './WeatherOverview.css';

class WeatherOverview extends React.Component {
  static propTypes = {
    className: PropTypes.string,
  };

  render() {
    return (null
            // <div className={cx(s.root, this.props.className)} role="navigation">
            //    <Link className={s.link} to="/about">About</Link>
            // </div>
        );
  }
}

export default withStyles(style)(WeatherOverview);
