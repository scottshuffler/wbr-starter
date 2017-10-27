import React from 'react';

export default class App extends React.Component {
  sum(a, b) {
    return a + b;
  }

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>Hello World</h1>
      </div>);
  }
}
