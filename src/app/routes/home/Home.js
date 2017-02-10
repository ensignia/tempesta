import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';

class Home extends React.Component {
  static propTypes = {
  };

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>React.js News</h1>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Home);
