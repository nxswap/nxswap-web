import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import '../css/App.css';

import Header from './Header';
import GetStarted from './GetStarted/GetStarted';
import Wallet from './Wallet/Wallet';
import Proposals from './Proposals/Proposals';
import Swap from './Swap/Swap';

import Track from './Track/Track';
import Footer from './Footer';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div id="app">
          <Header />
          <div id="content">
            <Switch>
              <Route path="/get-started"><GetStarted /></Route>
              <Route path="/wallet"><Wallet /></Route>
              <Route path="/proposals"><Proposals /></Route>
              <Route path="/track"><Track /></Route>
              <Route path="/"><Swap /></Route>
            </Switch>
          </div>
          <Footer />
        </div>
      </Router>
    )
  }
}

export default App;