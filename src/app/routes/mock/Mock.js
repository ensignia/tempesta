import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Nexus } from 'react-mobile-devices';
import cx from 'classnames';
import reactMobile from 'react-mobile-devices/dist/style.css';
import normalize from 'normalize.css';
import s from './Mock.css';

class Home extends React.Component {
  static propTypes = {
  };

  render() {
    return (
      <div className={cx(s.container, s.center, s.page, s.mockPage)}>
        <div className={s.inner}>
          <Nexus>
            <iframe className={s.frame} scrolling="no" src="/" />
          </Nexus>
        </div>
      </div>
    );
  }
}

export default withStyles(normalize, reactMobile, s)(Home);
