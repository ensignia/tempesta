import React from 'react';
import Home from './Home';
import fetch from '../../core/fetch';
import Layout from '../../components/Layout';

export default {

  path: '/',

  async action() {
    return {
      title: 'React Starter Kit',
      component: <Layout><Home /></Layout>,
    };
  },

};
