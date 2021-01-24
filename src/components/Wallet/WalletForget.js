import React from 'react';
import {
  Redirect, Link
} from "react-router-dom";

import { RecoveryKeyContext, RecoveryKey } from "../../contexts/RecoveryKeyContext";

class WalletForget extends React.Component {
  async forgetWallet() {
    await RecoveryKey.clearSavedRecoveryKey();
    // Now hard reload.. to ensure reset..
    window.location.reload();
  }

  render() {
    const { recoveryKeyLoading, recoveryKeyLoaded } = this.context;

    if (recoveryKeyLoading) return false;
    if (!recoveryKeyLoaded) {
      return (<Redirect to="/get-started" />)
    }

    return (
      <div className="singlecolumn">
        <div className="column wallet-lock">
          <div className="cont wallet-unlock">
            <h2>Confirm Forget Wallet?</h2>
            <span className="desc">Once you have forgotten your Wallet, you will need to re-load it using your Recovery Key.</span>
            <div className="actionButton">
              <button className="action" onClick={this.forgetWallet}>Confirm Forget Wallet</button>
            </div>
            <Link to="/wallet/unlock" className="otheraction">Cancel</Link>
          </div>
        </div>
      </div>
    )
  }
}

WalletForget.contextType = RecoveryKeyContext;
export default WalletForget;