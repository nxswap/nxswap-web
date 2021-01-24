import React from 'react';
import {
  Switch,
  Route
} from "react-router-dom";

import '../../css/Swap.css';
import TrackOverview from './TrackOverview';

function Wallet() {
  return (
    <Switch>
      <Route path="/track/:id" component={TrackOverview}></Route>
      <Route path="/track" component={TrackOverview}></Route>
    </Switch>
  )
}

export default Wallet;