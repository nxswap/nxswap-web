import React from 'react';
import {
  Switch,
  Route
} from "react-router-dom";

import '../../css/GetStarted.css';
import GetStartedMain from "./GetStartedMain";

function GetStarted() {
  return (
    <Switch>
      <Route path="/get-started/decrypt"><div>decrypt</div></Route>
      <Route path="/get-started"><GetStartedMain /></Route>
    </Switch>
  )
}

export default GetStarted;