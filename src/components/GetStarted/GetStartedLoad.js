import React from 'react';
import Dropzone from 'react-dropzone'
import { RecoveryKeyContext, RecoveryKey } from '../../contexts/RecoveryKeyContext';

class GetStartedLoad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      manualLoad: false,
      loadError: false
    }

    this.toggleEnterManually = this.toggleEnterManually.bind(this);
    this.manualLoadOnChange = this.manualLoadOnChange.bind(this);
  }

  async processAcceptedFiles(acceptedFiles) {
    this.setState({ loading: true });
    let loadError = false;
    let loadedRecoveryKey = false;
    if (acceptedFiles.length > 1) {
      loadError = 'Please only attempt to load 1 file.';
    } else if (acceptedFiles.length === 1) {
      let attemptFile = acceptedFiles[0];
      let fileType = attemptFile.type;
      if (fileType === "text/plain") {
        let attemptRead = await this.readAcceptedFile(attemptFile);
        if (attemptRead !== false && attemptRead !== undefined && attemptRead.length > 0) {
          // Attempt to load recovery key..
          let validateRecoveryKey = RecoveryKey.validateEncryptedRecoveryKey(attemptRead);
          if (!validateRecoveryKey) {
            loadError = 'This is not a valid Recovery Key';
          } else {
            // Good..save it..
            let saveRecoveryKey = await RecoveryKey.saveEncryptedRecoveryKeyBrowser(attemptRead);
            if (!saveRecoveryKey) {
              loadError = 'Failed to load recovery key to local storage.';
            } else {
              // good.
              loadedRecoveryKey = true;
            }
          }
        } else {
          loadError = 'Unable to load file';
        }
      } else {
        loadError = "This file type is not valid";
      }
    }

    if (loadedRecoveryKey) {
      console.log('its good its loaded!')
      return false;
    }

    this.setState({ loading: false, loadError: loadError });
  }

  async readAcceptedFile(file) {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = function () {
        resolve(this.result);
      };
      fileReader.readAsText(file);
    });
  }

  toggleEnterManually() {
    this.setState({
      manualLoad: this.state.manualLoad ? false : true
    });
  }

  async manualLoadOnChange(event) {
    let recoveryKey = event.target.value;
    let loadError = false;
    let loadedRecoveryKey = false;

    if (recoveryKey !== undefined && recoveryKey !== null && recoveryKey.length > 0) {
      // Attempt to validate it..
      let validateRecoveryKey = RecoveryKey.validateEncryptedRecoveryKey(recoveryKey);
      if (!validateRecoveryKey) {
        loadError = 'This is not a valid Recovery Key';
      } else {
        // Good..save it..
        let saveRecoveryKey = await RecoveryKey.saveEncryptedRecoveryKeyBrowser(recoveryKey);
        if (!saveRecoveryKey) {
          loadError = 'Failed to load recovery key to local storage.';
        } else {
          // good.
          loadedRecoveryKey = true;
        }
      }
    }

    if (loadedRecoveryKey) {
      return false;
    }

    this.setState({
      loading: false, loadError: loadError
    })
  }

  getDropzoneClass(isDragActive) {
    let dragActive = (isDragActive) ? "active" : "";
    return `dropzonecont ${dragActive}`;
  }

  renderDropzone() {
    let loadErrorClass = "Error";
    let loadError;

    if (this.state.loadError !== false) {
      loadErrorClass = "Error vis";
      loadError = this.state.loadError;
    }

    let dropzoneClass = "dropzone";
    if (this.state.loading) {
      dropzoneClass = "dropzone disabled";
    }

    return (
      <div className="cont get-started get-started-load">
        <h2>Load your Recovery Key</h2>
        <span className="desc">If you have got a NXSwap Recovery Key, you can load it below!</span>
        <div className={loadErrorClass}>{loadError}</div>
        <div className={dropzoneClass}>
          <Dropzone accept="text/plain" onDrop={acceptedFiles => this.processAcceptedFiles(acceptedFiles)}>
            {({ getRootProps, getInputProps, isDragActive }) => (
              <section>
                <div {...getRootProps()} className={this.getDropzoneClass(isDragActive)}>
                  <input {...getInputProps()} />
                  <p>Drag and Drop It Here<br />Or Click Here to Select It</p>
                </div>
              </section>
            )}
          </Dropzone>
          <span className="manually" onClick={this.toggleEnterManually}>Or click here to enter it manually</span>
        </div>
      </div>
    );
  }

  renderManual() {
    let loadErrorClass = "LoadError";
    let loadError;

    if (this.state.loadError !== false) {
      loadErrorClass = "LoadError vis";
      loadError = this.state.loadError;
    }

    return (
      <div className="cont get-started get-started-load">
        <h2>Load your Recovery Key</h2>
        <span className="desc">If you have got a NXSwap Recovery Key, you can load it below!</span>
        <div className={loadErrorClass}>{loadError}</div>
        <div className="manualLoad">
          <textarea onChange={this.manualLoadOnChange} placeholder="Paste your Recovery Key here"></textarea>
          <span className="manually" onClick={this.toggleEnterManually}>Or click here to upload it</span>
        </div>
      </div>
    )
  }

  render() {
    if (this.state.manualLoad) {
      return this.renderManual();
    } else {
      return this.renderDropzone();
    }
  }
}

GetStartedLoad.contextType = RecoveryKeyContext;
export default GetStartedLoad;