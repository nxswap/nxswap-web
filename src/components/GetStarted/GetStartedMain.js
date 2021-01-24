import React from 'react';
import {
  Redirect
} from "react-router-dom";

import { RecoveryKeyContext, RecoveryKey } from "../../contexts/RecoveryKeyContext";

import zxcvbn from 'zxcvbn';
import ClipboardJS from 'clipboard';
import GetStartedLoad from './GetStartedLoad';

new ClipboardJS('.copy-clipboard');

class GetStartedMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      encryptionPassphraseInput: false,
      showPassphrase: false,
      passphraseStrength: false,
      canCreate: false,
      createSuccess: false,
      encryptedRecoveryKey: false,
      showCreatedRecoveryKeyManually: false
    };

    this.handleEncryptionInputChange = this.handleEncryptionInputChange.bind(this);
    this.handleShowHidePassword = this.handleShowHidePassword.bind(this);
    this.handleCreateSubmit = this.handleCreateSubmit.bind(this);
    this.showCreatedRecoveryKeyManually = this.showCreatedRecoveryKeyManually.bind(this);
  }

  handleEncryptionInputChange(event) {
    let passphrase = event.target.value;
    let canCreate = false;

    let strength = zxcvbn(passphrase);
    let score = strength.score;

    if (passphrase.length > 0 && score > 1) {
      canCreate = true;
    }

    this.setState({ encryptionPassphraseInput: passphrase, canCreate: canCreate, passphraseStrength: strength });
  }

  handleShowHidePassword(event) {
    this.setState({
      showPassphrase: (this.state.showPassphrase) ? false : true
    });
  }

  handleCreateSubmit(event) {
    event.preventDefault();
    if (!this.state.canCreate) return false;

    let createRecoveryKey = RecoveryKey.createNewRecoveryKey(this.state.encryptionPassphraseInput);
    if (!createRecoveryKey) return false;

    let encryptedRecoveryKey = createRecoveryKey.encryptedRecoveryKey;

    this.setState({
      createSuccess: true,
      encryptedRecoveryKey: encryptedRecoveryKey
    })

    return false;
  }

  preCreate() {
    let canCreate = this.state.canCreate ? false : "disabled";
    let showHideText = this.state.showPassphrase ? "Hide" : "Show";
    let showHideType = this.state.showPassphrase ? "text" : "password";

    let strength = this.state.passphraseStrength;
    let strengthScore = (this.state.encryptionPassphraseInput.length > 0) ? strength.score : false;
    let passphraseScoreClass = (strengthScore === false) ? "" : `score${strengthScore}`;

    let passphraseSuggestClass = "passphraseSuggest";
    let passphraseSuggest = "";

    if (strengthScore === 0) {
      let warning = strength.feedback.warning;
      let suggestions = strength.feedback.suggestions;
      if (warning.length > 0) {
        passphraseSuggestClass = "passphraseSuggest show";
        passphraseSuggest = warning;
      } else if (suggestions.length > 0) {
        passphraseSuggestClass = "passphraseSuggest show";
        passphraseSuggest = suggestions;
      }
    }

    return (
      <div className="cont get-started get-started-create">
        <h2>Create your Recovery Key</h2>
        <span className="desc">Being a truly non-custodial platform, you'll need to keep a backup of your funds.</span>
        <span className="desc">We achieve this using a Recovery Key. You'll need to encrypt it with a passphrase so that it can be stored securely.</span>
        <form onSubmit={this.handleCreateSubmit}>
          <div className="encryptionPassphrase">
            <span className="showhide" onClick={this.handleShowHidePassword}>{showHideText}</span>
            <input onChange={this.handleEncryptionInputChange} type={showHideType} name="password" placeholder="Enter A Passphrase" />
            <span className="passphraseScore">
              <span className={passphraseScoreClass}></span>
            </span>
            <span className={passphraseSuggestClass}>{passphraseSuggest}</span>
          </div>
          <button className="create" disabled={canCreate}>Create</button>
        </form>
      </div>
    )
  }

  showCreatedRecoveryKeyManually() {
    this.setState({
      showCreatedRecoveryKeyManually: (this.state.showCreatedRecoveryKeyManually) ? false : true
    })
  }

  createSuccess() {
    let manually = this.state.showCreatedRecoveryKeyManually;
    if (!manually) {
      return this.createSuccessDownload();
    } else {
      return this.createSuccessManually();
    }
  }

  createSuccessDownload() {
    let downloadHref = 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.state.encryptedRecoveryKey);
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let downloadFileName = `NXSwap_RecoveryKey_${date}.txt`;

    return (
      <div className="cont get-started get-started-create">
        <h2>Success! Your Recovery Key</h2>
        <span className="desc">We have created your Recovery Key. This has been encrypted with the passphrase you entered.</span>
        <span className="desc">If you lose your Recovery Key or forget your passphrase, your funds could be at risk.</span>
        <span className="desc">You can now download the Recovery Key and store it somewhere safe! You can now Load your Recovery Key!</span>
        <div className="downloadRecoveryKey">
          <a href={downloadHref} download={downloadFileName} className="download">Download Recovery Key</a>
          <span className="manually" onClick={this.showCreatedRecoveryKeyManually}>Or click here to copy the contents manually</span>
        </div>
      </div>
    )
  }

  createSuccessManually() {
    let downloadHref = 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.state.encryptedRecoveryKey);
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let downloadFileName = `NXSwap_RecoveryKey_${date}.txt`;
    return (
      <div className="cont get-started get-started-create">
        <h2>Success! Your Recovery Key</h2>
        <span className="desc">You can copy the contents of your recovery key manually below. Please ensure you copy all of it and store it somewhere safe.</span>
        <div className="manualRecoveryKey">
          <textarea id="createEncryptedRecoveryKey" defaultValue={this.state.encryptedRecoveryKey}></textarea>
          <button className="copy-clipboard" data-clipboard-target="#createEncryptedRecoveryKey">Copy To Your Clipboard</button>
        </div>

        <div className="downloadRecoveryKey">
          <a href={downloadHref} download={downloadFileName} className="download">Or, Click to Download Your Recovery Key</a>
        </div>
      </div>
    )
  }

  render() {
    const { recoveryKeyLoading, recoveryKeyLocked, recoveryKeyLoaded } = this.context;

    if (recoveryKeyLoading) return false;
    if (recoveryKeyLoaded && recoveryKeyLocked) {
      return (<Redirect to="/wallet/unlock" />)
    }
    else if (recoveryKeyLoaded) {
      return (<Redirect to="/" />)
    }

    let createColumn;

    if (!this.state.createSuccess) {
      createColumn = this.preCreate();
    } else {
      createColumn = this.createSuccess();
    }

    return (
      <div className="splitcolumn">
        <div className="column">
          {createColumn}
        </div>
        <div className="divider"></div>
        <div className="column">
          <GetStartedLoad />
        </div>
      </div>
    )
  }
}

GetStartedMain.contextType = RecoveryKeyContext;
export default GetStartedMain;