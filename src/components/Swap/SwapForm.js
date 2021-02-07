import React from 'react';
import { WalletContext } from '../../contexts/WalletContext';
import { Negotiator, NXMeta, UserAuthObject, SUPPORTED_CURRENCIES } from '../../js/NXSwapTaker';

import '../../css/Swap.css';
import CurrencySelector from './CurrencySelector';
import WalletModalDeposit from '../Wallet/WalletModalDeposit';

class SwapForm extends React.Component {
	constructor(props) {
    super(props);
    this.type = ( ! props.type ? "request" : props.type );
		this.state = {
			now: false,
      showHomeHeader: true,
			depositCurrency: 'TBTC',
      receiveCurrency: 'TVTC',
      peerID: false,
			peerIDError: false,
			peerIDErrorText: 'Error',
			swapAmount: '',
			forAmount: '',
			showCurrencySelector: false,
			showCurrencySelectorFor: false,
			editSwapAmount: true,
			editForAmount: false,
      showDepositModal: false,
      canPropose: false
		}
	}

	showCurrencySelector(which) {
		this.setState({
			showCurrencySelector: true,
			showCurrencySelectorFor: which
		})
	}

	hideCurrencySelector() {
		this.setState({
			showCurrencySelector: false,
			showCurrencySelectorFor: false
		})
	}

	onSelectCurrency(currency) {
		let newState = {
			showCurrencySelector: false,
			showCurrencySelectorFor: false
		}

		if( this.state.showCurrencySelectorFor === 'deposit' ) {
			newState.depositCurrency = currency;
		} else if( this.state.showCurrencySelectorFor === 'receive') {
			newState.receiveCurrency = currency;
		}

		this.setState(newState, () => {
			this.update();
		});
	}

	editSwapAmount() {
		this.setState({
			editSwapAmount: true,
			editForAmount: false
		})
	}

	editForAmount() {
		this.setState({
			editSwapAmount: false,
			editForAmount: true
		})
	}

	showDepositModal(curr) {
		this.setState({
			showDepositModal: curr
		})
	}

	closeDepositModal() {
		this.setState({
			showDepositModal: false
		})
  }
  
  async onChangePeerID(event) {
    let peerID = (event.target.value.length > 0 ) ? event.target.value : false;
    this.setState({
      peerID: peerID
    }, () => {
      this.update();
    });
  }

	async onChangeSwapAmount(event) {
		let swapAmount = event;
		if( isNaN(swapAmount) ) {
			swapAmount = event.target.value;
		}
		if( isNaN(swapAmount) ) {
      swapAmount = false;
    }

		this.setState({
			editSwapAmount: true,
			editForAmount: false,
			swapAmount: swapAmount
		}, () => {
			this.update();
		})
	}

	async onChangeForAmount(event) {
		let forAmount = event;
		if( isNaN(forAmount) ) {
			forAmount = event.target.value;
		}
		if( isNaN(forAmount) ) {
      forAmount = false;
    }

		this.setState({
			editSwapAmount: false,
			editForAmount: true,
			forAmount: forAmount
		}, () => {
			this.update();
		})
  }
  
  async update() {
    if(this.type === "propose") {
      this.updateProposeForm();
    } else if ( this.type === "request" ) {
      
    }
  }

  async updateProposeForm () {
    let userAuthorised = (UserAuthObject !== false) ? true : false;
    if( ! userAuthorised ) {
      this.setState({
        canPropose: false,
        peerIDError: false
      });
		}
		
    // Validate peer id..
    let peerID = this.state.peerID;
    if( ! peerID || peerID.length === 0 ) {
      this.setState({
        canPropose: false,
        peerIDError: false
      });
      return false;
    } else {
      let bufPeerID = false;
      try {
        bufPeerID = Buffer.from(peerID, 'hex');
        if( bufPeerID.length !== 33 ) {
          bufPeerID = false;
        }
			} catch(e) { }

      if( ! bufPeerID ) {
        // Not a valid length public key?
        this.setState({
          canPropose: false,
					peerIDError: true,
					peerIDErrorText: 'Invalid Peer ID'
        });
        return false;
      } else {
				// No self swaps
				if( peerID === UserAuthObject.pubKey ) {
					this.setState({
						canPropose: false,
						peerIDError: true,
						peerIDErrorText: 'No Self Swaps'
					});
					return false;
				}
			}
    }
    let newState = {
      peerIDError: false
    }
    // Peer ID is good..
    // Valid amounts?

    if( this.state.depositCurrency === this.state.receiveCurrency && this.state.swapAmount > 0 ) {
      newState.canPropose = true;
    } else if ( this.state.depositCurrency !== this.state.receiveCurrency && this.state.swapAmount > 0 && this.state.forAmount > 0 ) {
      newState.canPropose = true;
    } else {
      newState.canPropose = false;
    }

    this.setState(newState);
  }

  async clickProposeSwap () {
    if(! this.state.canPropose) return false;
    // Build Proposal..
    let createProposal = Negotiator.createSwapProposal({
      a_currency: this.state.depositCurrency,
      a_amount: this.state.swapAmount,
      a_expires: 60,
      b_pubkey: this.state.peerID,
      b_currency: this.state.receiveCurrency,
      b_amount: this.state.forAmount
    });

    if( ! createProposal ) {
      return false;
		}
		
    // ok we have created a proposal..
    // now we need to send it..
		
		Negotiator.sendSwapProposal(createProposal);
	}

	render() {
		const { walletBalances } = this.context;
		let balances = walletBalances;

		let supportedCurrencies = [];
		for( let tick in NXMeta.currencies ) {
			if( SUPPORTED_CURRENCIES.includes(tick)) {
				supportedCurrencies.push(NXMeta.currencies[tick]);
			}
		}

		//let currencyAvailability = [];
		let depositCurrency = this.state.depositCurrency;
		let receiveCurrency = this.state.receiveCurrency;

		let depositCurrencyMeta = NXMeta.currencies[depositCurrency];
		let receiveCurrencyMeta = NXMeta.currencies[receiveCurrency];

		let currentBalance = false;
		let userAuthorised = (UserAuthObject !== false) ? true : false;

		if( balances !== undefined && userAuthorised ) {
			let thisbal = balances[depositCurrency];
			if( thisbal === undefined ) return false;
			currentBalance = thisbal;
		}

		return (
			<>
			<div className="singlecolumn just-c">
        {this.type === "request" && this.state.showHomeHeader && (
				<div className="homepage">
					<div className="meta">
						<div className="metaMain">
							<h1>Truly Non-Custodial Swaps</h1>
							<h2>&ldquo;Not Your Keys, Not Your Coins&rdquo;</h2>
						</div>
						<div className="metaSub">
							<span>Using the power of Atomic Swaps, your funds never leave your custody. It's secure, it's private and it's just as easy as your typical Swap platform.</span>
						</div>
					</div>
				</div>
        )}
        {this.type === "propose" && this.state.showHomeHeader && (
				<div className="homepage">
					<div className="meta">
						<div className="metaMain">
							<h1>Propose An Atomic Swap</h1>
							<h2>Swap directly with a known peer!</h2>
						</div>
            <div className="metaSub">
							<span>Trade directly with someone you know without having to trust them. No trading fees, no middle man, no risks.</span>
						</div>
					</div>
				</div>
        )}
				<div className="swap">
					<div className="swapamountbar">
						<div className="amountfield">
              {this.type === "propose" && (
                <>
                <label>Your Public Key</label>
                <input type="text" className="peer" disabled={true} value={userAuthorised ? UserAuthObject.pubKey : `You must Get Started or Unlock your Wallet first`} />
                </>
              )}
							<label className={this.state.editSwapAmount ? 'selected' : ''}>Swap</label>
							{this.state.editSwapAmount ? (
								<input type="text" className="amount" placeholder="0.00000000" value={this.state.swapAmount} onChange={(event) => this.onChangeSwapAmount(event)} />
							) : (
								<input type="text" className="amount" placeholder="0.00000000" value={this.state.swapAmount} readOnly={true} onClick={() => this.editSwapAmount()} />
							)}
							<span className="icon"><img src={depositCurrencyMeta.icon} alt={depositCurrency} /></span>
							<span className="select" onClick={() => {this.showCurrencySelector('deposit')}}>{depositCurrency}</span>
						</div>
						<div className="amountfield">
              {this.type === "propose" && (
                <>
                <label>Propose Swap To <span className={`${(this.state.peerIDError ? ('error') : ('hidden'))}`}>({this.state.peerIDErrorText})</span></label>
                <input type="text" className={`peer ${(this.state.peerIDError ? ('error') : false)}`} placeholder="Your Peers Public Key" onChange={(event) => this.onChangePeerID(event)} disabled={userAuthorised ? false : true} />
                </>
              )}
							<label className={this.state.editForAmount ? 'selected' : ''}>For</label>
              {this.state.depositCurrency === this.state.receiveCurrency && (
                <>
                <input type="text" className="amount" placeholder="auto" disabled={true} />
                </>
              )}
              {this.state.depositCurrency !== this.state.receiveCurrency && (
                <>
                {this.state.editForAmount ? (
                  <input type="text" className="amount" placeholder="0.00000000" value={this.state.forAmount} onChange={(event) => this.onChangeForAmount(event)} />
                ) : (
                  <input type="text" className="amount" placeholder="0.00000000" value={this.state.forAmount} readOnly={true} onClick={() => this.editForAmount()} />
                )}
                </>
              )}
							
							<span className="icon"><img src={receiveCurrencyMeta.icon} alt={receiveCurrency} /></span>
							<span className="select" onClick={() => {this.showCurrencySelector('receive')}}>{receiveCurrency}</span>
						</div>
						<div className="buttonfield">
              {this.type === "propose" && (
                <>
                <button disabled={this.state.canPropose ? (false) : (true)} onClick={() => this.clickProposeSwap()}>Propose Swap</button>
                </>
              )}
              {this.type === "request" && (
                <>
                <button disabled={true} onClick={() => this.clickViewOffers()}>View Offers</button>
                </>
              )}
						</div>
					</div>
					{userAuthorised && (
						<div className="swapbelowamounts">
						<div className="balance" onClick={() => this.onChangeSwapAmount(currentBalance.available.formatted)}>
							<small>{depositCurrency} Available</small>
							{this.state.swapAmount > currentBalance.available.float ? (
								<span className="invalid">{currentBalance.available.formatted}</span>
							) : (
								<span>{currentBalance.available.formatted}</span>
							)}
						</div>
						{currentBalance.pending.raw > 0 && (
						<div className="balance no">
							<span>Pending</span> {currentBalance.pending.formatted}
						</div>
						)}
						<button className="deposit" onClick={() => this.showDepositModal(depositCurrency)}>Deposit {depositCurrency}</button>
					</div>
					)}
				</div>
			</div>
			{this.state.showCurrencySelector !== false && (
				<CurrencySelector parentState={this.state} supportedCurrencies={supportedCurrencies} onSelectCurrency={this.onSelectCurrency.bind(this)} hideCurrencySelector={this.hideCurrencySelector.bind(this)} />
			)}
			<WalletModalDeposit  close={() => {this.closeDepositModal()}} showDepositModal={this.state.showDepositModal} />
			</>
		)
	}
}


SwapForm.contextType = WalletContext;
export default SwapForm;