import React, { PropTypes } from 'react';

class Store {
  constructor(actions) {
    this.actions = actions;
    this.state = {};
    this.listeners = [];

    this.getState = this.getState.bind(this);
    this.dispatch = this.dispatch.bind(this);
    this.subscribe = this.subscribe.bind(this);

    if (this.actions.initialize) this.state = this.actions.initialize();
  }

  getState() {
    return this.state;
  }

  dispatch(action, ...args) {
    const nextState = this.actions[action](this.state, ...args);
    if (!Object.is(nextState, this.state)) {
      this.state = nextState;
      this.listeners.forEach(listener => listener());
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

}

export default Store;

function bindToDispatch(actions, dispatch) {
  const bound = {};
  Object.keys(actions).forEach((key) => {
    bound[key] = (...args) => {
      dispatch(key, ...args);
    };
  });
  return bound;
}

export function connect(mapStateToProps) {
  return (WrappedComponent) => (
    class extends React.Component {
      static contextTypes = {
        store: PropTypes.object.isRequired,
      };

      componentWillMount() {
        this.removeListener = this.context.store.subscribe(() => {
          this.forceUpdate();
        });
      }

      componentWillUnmount() {
        this.removeListener();
      }

      render() {
        const actions = bindToDispatch(this.context.store.actions, this.context.store.dispatch);
        const state = mapStateToProps ? mapStateToProps(this.context.store.getState()) : {};
        const props = { actions, ...state, ...this.props };
        return <WrappedComponent {...props} />;
      }
    }
  );
}
