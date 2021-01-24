import React from 'react';
import { Wallet, NXMeta } from '../../js/NXSwapTaker';
import ClipboardJS from 'clipboard';
import QRCode from 'qrcode';

import '../../css/Modal.css';

new ClipboardJS('.copy-clipboard');

class WalletModalDeposit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showQR: false,
      QRCodeSRC: false,
      showPreviousAddresses: false
    }
  }

  close() {
    this.setState({showQR: false, QRCodeSRC: false, showPreviousAddresses: false});
    this.props.close();
  }

  showPreviousAddresses(show) {
    this.setState({showQR: false, showPreviousAddresses: show});
  }

  QRCodeShow(show, address) {
    if( !show ) {
      this.setState({showQR: false, QRCodeSRC: false});
      return true;
    }

    QRCode.toDataURL(address)
    .then(url => {
      this.setState({showQR: true, QRCodeSRC: url});
    })
    .catch(err => {
      console.error(err)
    })
  }

  PreviousAddresses (props) {
    let curr = props.curr;
    if( ! curr ) return false;

    let previousAddresses = Wallet.getPreviousAddresses(curr);

    if( ! previousAddresses || previousAddresses.length === 0 ) {
      return false;
    }

    const listAddresses = previousAddresses.map((addr) => {
      return (
        <tr key={addr.address}>
          <td className="address">{addr.address}</td>
          <td className="path">{addr.fullPath}</td>
        </tr>
      )
    });

    return (
      <>
      <div className="modalContent">
        <small className="label">Your Previous Addresses</small>
      </div>
      <div className="modalTable">
      <table className="prevAddresses" cellPadding="0" cellSpacing="0">
        <thead>
          <tr>
            <th className="address">Address</th>
            <th className="path">Path</th>
          </tr>
        </thead>
        <tbody>
          {listAddresses}
        </tbody> 
      </table>
      </div>
      </>
    )
  }

  render () {
    let curr = this.props.showDepositModal;
    if( ! curr ) return false;
    
    let meta = NXMeta.currencies[curr];

    const onClickBG = (event) => {
      let target = event.target;
      let targetClass = target.getAttribute('class');

      if(targetClass === "modalWindowOverlay") {
        this.close();
      }
    }

    let nextAddress = Wallet.getNextAddress(curr, false);

    let nextPath = nextAddress.nextShortPath;
    let hasPrevAddresses = true;
    
    if( nextPath === "0/0" ) {
      hasPrevAddresses = false;
    }

    let showPrevAddressLink = false;

    if( hasPrevAddresses ) {
      if( this.state.showPreviousAddresses ) {
        showPrevAddressLink = <span className="labelAction" onClick={() => this.showPreviousAddresses(false)}>Hide Previous Addresses</span>;
      } else {
        showPrevAddressLink = <span className="labelAction" onClick={() => this.showPreviousAddresses(true)}>See Previous Addresses</span>;
      }
    }

    return (
      <div className="modalWindowOverlay" onClick={(event) => {onClickBG(event)}} >
        <div className="modalWindow">
          <div className="modalHeader">
            <img src={meta.icon} alt={curr} />
            <h3>Deposit {meta.name}</h3>
            <span className="close" onClick={() => this.close()}>
              <img src="/img/close.svg" alt="Close" />
            </span>
          </div>
          <div className="modalInput">
            <label className="noCurs" htmlFor="receiveNextAddress">
              <span>Your Deposit Address</span>
              {showPrevAddressLink}
            </label>
            <input id="receiveNextAddress" name="receiveNextAddress" type="text" value={nextAddress.nextAddress} readOnly={true} />
            <span className="inputAction copy-clipboard" data-clipboard-target="#receiveNextAddress">
              <img src="/img/clipboard.svg" className="copy" alt="Copy"  />
            </span>
          </div>
          {this.state.showPreviousAddresses ? (
            <this.PreviousAddresses curr={curr} />
          ) : (
            <div className="modalLink">
            {this.state.showQR ? (
              <span onClick={() => this.QRCodeShow(false)}>Hide QR Code</span>
            ) : (
              <span onClick={() => this.QRCodeShow(true, nextAddress.nextAddress)}>Show QR Code</span>
            )}
          </div>
          )}
          
          {this.state.showQR && (
          <div className="modalContent text-center">
            <img src={this.state.QRCodeSRC} alt="" />
          </div>
          )}
        </div>
      </div>
    )
  }
}

export default WalletModalDeposit;