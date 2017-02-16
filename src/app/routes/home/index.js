import React from 'react';
import Home from './Home';
import fetch from '../../core/fetch';
import Layout from '../../components/Layout/Layout.js';

export default {

  path: '/',

  async action() {
    return {
      title: 'Home',
      component: <Layout><Home /></Layout>,
    };
  },

};
