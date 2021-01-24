import React from 'react';
import {
  Redirect,
  Link
} from "react-router-dom";

import { RecoveryKeyContext, RecoveryKey } from "../../contexts/RecoveryKeyContext";

class WalletUnlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      canUnlock: false,
      showPassphrase: false,
      unlockError: false
    }

    this.handleShowHidePassword = this.handleShowHidePassword.bind(this);
    this.handleEncryptionInputChange = this.handleEncryptionInputChange.bind(this);
    this.handleSubmitLocked = this.handleSubmitLocked.bind(this);
  }

  handleShowHidePassword() {
    this.setState({
      showPassphrase: (this.state.showPassphrase) ? false : true
    });
  }

  handleEncryptionInputChange(event) {
    let encryptionPassphrase = event.target.value;
    let canUnlock = false;
    if (encryptionPassphrase !== undefined && encryptionPassphrase !== null && encryptionPassphrase.length > 0) {
      canUnlock = true;
    }

    this.setState({
      encryptionPassphrase: encryptionPassphrase,
      canUnlock: canUnlock,
      unlockError: false
    });
  }

  async handleSubmitLocked(event) {
    event.preventDefault();
    this.setState({ loading: true });
    let encryptionPassphrase = this.state.encryptionPassphrase;
    if (!this.state.canUnlock) return false;
    if (!encryptionPassphrase || encryptionPassphrase.length <= 0) return false;

    let attemptUnlock = await RecoveryKey.saveEncryptionPassphrase(encryptionPassphrase);

    if (!attemptUnlock) {
      this.setState({
        loading: false,
        unlockError: 'Unlock failed. Wrong Passphrase?'
      });
    } else {
      console.log(attemptUnlock);
    }
  }

  render() {
    // Should you be here?
    const { recoveryKeyLoading, recoveryKeyLocked, recoveryKeyLoaded } = this.context;

    if (recoveryKeyLoading) return false;
    if (!recoveryKeyLoaded) {
      return (<Redirect to="/get-started" />)
    }
    else if (!recoveryKeyLocked) {
      return (<Redirect to="/wallet" />)
    }

    let unlockErrorClass = "Error";
    let unlockError;

    if (this.state.unlockError !== false) {
      unlockErrorClass = "Error vis";
      unlockError = this.state.unlockError;
    }

    let canUnlock = this.state.canUnlock ? false : "disabled";
    let showHideText = this.state.showPassphrase ? "Hide" : "Show";
    let showHideType = this.state.showPassphrase ? "text" : "password";

    return (
      <div className="singlecolumn">
        <div className="column">
          <div className="cont wallet-unlock">
            <h2>Your Wallet Is Locked</h2>
            <span className="desc">Your Recovery Key is loaded into your browsers local storage, however it is stored encrypted.</span>
            <span className="desc">You'll need to enter the passphrase you set when you created your Recovery Key.</span>
            <div className={unlockErrorClass}>{unlockError}</div>
            <form onSubmit={this.handleSubmitLocked}>
              <div className="encryptionPassphrase">
                <span className="showhide" onClick={this.handleShowHidePassword}>{showHideText}</span>
                <input onChange={this.handleEncryptionInputChange} type={showHideType} name="password" placeholder="Enter Your Passphrase" />
              </div>
              <button className="unlock" disabled={canUnlock}>Unlock</button>
            </form>
            <Link to="/wallet/forget" className="manually">Click Here to Forget Your Wallet</Link>
          </div>
        </div>
      </div>
    )
  }
}

WalletUnlock.contextType = RecoveryKeyContext;
export default WalletUnlock;