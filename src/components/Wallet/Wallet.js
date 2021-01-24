import React from 'react';
import {
  Switch,
  Route
} from "react-router-dom";

import '../../css/Wallet.css';
import WalletUnlock from './WalletUnlock';
import WalletLock from './WalletLock';
import WalletForget from './WalletForget';
import WalletOverview from './WalletOverview';

function Wallet() {
  return (
    <Switch>
      <Route path="/wallet/unlock"><WalletUnlock /></Route>
      <Route path="/wallet/lock"><WalletLock /></Route>
      <Route path="/wallet/forget"><WalletForget /></Route>
      <Route path="/wallet"><WalletOverview /></Route>
    </Switch>
  )
}

export default Wallet;