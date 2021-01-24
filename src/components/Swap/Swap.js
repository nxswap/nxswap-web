import React from 'react';
import {
  Switch,
  Route
} from "react-router-dom";

import SwapPropose from './SwapPropose';
import SwapRequest from './SwapRequest';

function Swap() {
  return (
    <Switch>
      <Route path="/propose"><SwapPropose /></Route>
      <Route path="/request"><SwapRequest /></Route>
      <Route path="/"><SwapPropose /></Route>
    </Switch>
  )
}

export default Swap;