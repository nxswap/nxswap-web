import React from 'react';
import { NXMeta } from '../../js/NXSwapTaker';

import '../../css/Modal.css';

class SwapProposalModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accepted: false
    }
  }

  acceptProposal () {
    this.setState({
      accepted: true
    }, () => {
      this.props.acceptSwapProposal()
    })
  }

  render () {
    let proposingSwap = this.props.parentState.proposingSwap;
    if( ! proposingSwap ) return false;

    let proposeSwap = this.props.parentState.proposeSwap;
    let proposalExpires = proposeSwap.requestAcceptExpires;

    let proposalTimeLeft = proposalExpires - this.props.parentState.now;

    let depositCurrency = proposeSwap.fromCurrency;
    let receiveCurrency = proposeSwap.toCurrency;

    let depositCurrencyMeta = NXMeta.currencies[depositCurrency];
    let receiveCurrencyMeta = NXMeta.currencies[receiveCurrency];
  
    let depositCurrencyName = depositCurrencyMeta.name.replace( '(Testnet)', '' );
    let receiveCurrencyName = receiveCurrencyMeta.name.replace( '(Testnet)', '' );

    return (
      <div className="modalWindowOverlay">
        <div className="modalWindow">
          <div className="modalHeader">
            <h3>Confirm Swap</h3>
            <span>Offer Expires in ({proposalTimeLeft})</span>
          </div>
          <div className="modalFlexRow">
            <div className="modalFlexColumn">
              <img className="currencyIcon" src={depositCurrencyMeta.icon} alt={depositCurrency} />
              <span className="label">Swap</span>
              <span className="amount">{proposeSwap.fromAmount}</span>
              <span className="currencyName">{depositCurrencyName}</span>
            </div>
            <div className="modalFlexColumn">
              <img className="arrowBetween" src="/img/arrow-right.png" alt=">" />
            </div>
            <div className="modalFlexColumn">
              <img className="currencyIcon" src={receiveCurrencyMeta.icon} alt={receiveCurrency} />
              <span className="label">For</span>
              <span className="amount">{proposeSwap.toAmount}</span>
              <span className="currencyName">{receiveCurrencyName}</span>
            </div>
          </div>
          <div className="modalText text-center">
            <p><strong>Your {depositCurrencyName} will require <strong className="highlight">{proposeSwap.confirmations}</strong> confirmation(s) before the Swap will complete.</strong></p>
            <p>Once you start the swap, the Swap will automatically take place. You must leave your browser window open until advised otherwise. Should you disconnect for any reason, you must return asap in order for the Swap to continue.</p>
            <p className="highlight big">By continuing you understand <a href="/how-it-works" target="_blank">How it Works</a> and are willing to proceed.</p>
          </div>
          <div className="modalAction">
            <button className="cancel" onClick={() => this.props.cancelSwapProposal()}>Cancel</button>
            <button className="confirm" disabled={this.state.accepted} onClick={() => this.acceptProposal()}>Start Swap</button>
         </div> 
        </div>
      </div>
    )
  }
}

export default SwapProposalModal;