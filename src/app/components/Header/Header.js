import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import Link from '../Link/Link.js';
import Navigation from '../Navigation/Navigation.js';
import WeatherOverview from '../WeatherOverview/WeatherOverview.js';
import logoUrl from './logo-small.png';
import logoUrl2x from './logo-small@2x.png';

class Header extends React.Component {
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <Navigation className={s.nav} />
          <Link className={s.brand} to="/">
            <img src={logoUrl} srcSet={`${logoUrl2x} 2x`} width="38" height="38" alt="Tempesta" />
            <span className={s.brandTxt}>Tempesta</span>
          </Link>
          <WeatherOverview />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Header);
