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
    this.state = this.actions[action](this.state, ...args);
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

}

export default Store;
