import React from 'react';
import {
  Redirect
} from "react-router-dom";
import { WalletContext } from '../../contexts/WalletContext';
import { RecoveryKey, Wallet, NXMeta, UserAuthObject, SUPPORTED_CURRENCIES } from '../../js/NXSwapTaker';

import '../../css/Swap.css';
import CurrencySelector from './CurrencySelector';
import SwapOfferTable from './SwapOfferTable';
import SwapProposalModal from './SwapProposalModal';
import WalletModalDeposit from '../Wallet/WalletModalDeposit';

class Swap extends React.Component {
	constructor(props) {
		super(props);
		this.interval = false;
		this.expireInterval = false;
		this.state = {
			now: false,
      showHomeHeader: true,
			depositCurrency: 'TBTC',
			receiveCurrency: 'TVTC',
			swapAmount: '',
			forAmount: '',
			showCurrencySelector: false,
			showCurrencySelectorFor: false,
			editSwapAmount: true,
			editForAmount: false,
			showDepositModal: false,
      showOffers: false,
      offers: [],
			offersExpire: false,
			requestingSwap: false,
			requestSwap: false,
			proposingSwap: false,
			proposeSwap: false,
			acceptedSwap: false
		}
	}

	componentWillUnmount() {
		this.stopNowTimer();
		//SwapAPI.removeListener('swapProposal', this.swapProposalListener)
	}

	componentDidMount() {
		//SwapAPI.on('swapProposal', (payload) => { this.swapProposalListener(payload) });
		//SwapAPI.on('swapRequestDeclined', this.swapRequestDeclinedListener.bind(this));
	}

	swapProposalListener(payload) {
		let requestUUID = payload.requestUUID;
		if( requestUUID === undefined ) return false;

		if( this.state.requestSwap.requestUUID !== undefined && this.state.requestSwap.requestUUID === requestUUID ) {
			// Ok..
			// Validate the fromAddress here?!!!!! maybe..
			
			this.setState({
				proposingSwap: true,
				proposeSwap: payload
			});
		} else {
			// Not interested? it's not the one we need? multi window? bug? er?
		}
	}

	cancelSwapProposal() {
		this.setState({
			proposingSwap: false,
			proposeSwap: false,
			requestingSwap: false,
			requestSwap: false
		}, () => {
			this.update();
		});
	}

	async acceptSwapProposal() {
		if( !this.state.proposingSwap || !this.state.proposeSwap ) return false;
		let proposeSwap = this.state.proposeSwap;
		let requestUUID = proposeSwap.requestUUID;

		if( ! requestUUID ) return false;
		if( ! Wallet.isSwapDBInitialised() ) {
			return false;
		}

		// Add the Swap to DB..
		let addSwap = Wallet.swapDB.insertNewSwap('taker', proposeSwap);

		if( ! addSwap ) {
			console.log('failed to add swap?!');
		} else {
			// Added Swap..
			// Now submit to API..
			/*
			let agreeProposal = await SwapAPI.wsAPIRPC({
				method: 'swap.agreeProposal',
				payload: {
					agree: proposeSwap
				},
				sign: true
			});

			if( agreeProposal.data.agreed ) {
				// Update the agreedHash..
				let updateSwap = Wallet.swapDB.updateSwap('taker', requestUUID, {
					agreedHash: agreeProposal.data.agreedHash
				});

				if( updateSwap ) {
					// Ok good.. move to track Swap..
					this.setState({
						acceptedSwap: requestUUID
					});
				}
			} else {
				// Failed to accept..
				console.log('failed?')
				console.log(agreeProposal)
			}
			*/
		}
	}

	swapRequestDeclinedListener(payload) {
		console.log('swapRequestDeclined', payload);
	}

	startNowTimer() {
		this.stopNowTimer();
		this.intervalNow = setInterval(() => {
			this.setState({
				now: Math.round((Date.now() / 1000))
			}, () => {
				this.processNow();
			});
			
		}, 1000);
		this.setState({
			now: Math.round((Date.now() / 1000))
		});
	}

	stopNowTimer () {
		if( this.intervalNow !== false ) clearInterval(this.intervalNow);
		this.setState({
			now: false
		});
	}

	processNow () {
		let now = this.state.now;
		let userAuthorised = (UserAuthObject !== false) ? true : false;

		if( this.state.proposingSwap !== false && userAuthorised ) {
			let proposal = this.state.proposeSwap;
			let proposalExpires = proposal.requestAcceptExpires;
			
			if( now >= proposalExpires ) {
				this.setState({
					proposingSwap: false,
					proposeSwap: false,
					requestingSwap: false,
					requestSwap: false
				}, () => {
					this.update();
				})
			}
		}
		else if( this.state.requestingSwap !== false ) {
			let requestExpires = this.state.requestSwap.expires;
			if( now > requestExpires ) {
				this.setState({
					requestingSwap: false,
					requestSwap: false
				}, () => {
					this.update();
				})
			}
		}
		else if( this.state.showOffers ) {
			if( now >= this.state.offersExpire ) {
				this.update();
			}
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

	async onChangeSwapAmount(event) {
		let swapAmount = event;
		if( isNaN(swapAmount) ) {
			swapAmount = event.target.value;
		}
		if( isNaN(swapAmount) ) return false;
		if( swapAmount.length === 0 || swapAmount <= 0 ) {
			if(swapAmount.length === 0 ) swapAmount = '';
			this.setState({
				swapAmount: swapAmount,
				forAmount: ''
			})
			return;
		};

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
		if( isNaN(forAmount) ) return false;
		
		if( forAmount.length === 0 || forAmount <= 0 ) {
			if(forAmount.length === 0 ) forAmount = '';
			this.setState({
				swapAmount: '',
				forAmount: forAmount
			})
			return;
		};

		this.setState({
			editSwapAmount: false,
			editForAmount: true,
			forAmount: forAmount
		}, () => {
			this.update();
		})
  }
  
  async update() {
    let payload = {
			from: this.state.depositCurrency,
			to: this.state.receiveCurrency,
		}

		if(this.state.editSwapAmount && ! isNaN(this.state.swapAmount) && this.state.swapAmount > 0) {
			payload.fromAmount = this.state.swapAmount;
		} else if( this.state.editForAmount && ! isNaN(this.state.forAmount) && this.state.forAmount > 0 ) {
			payload.toAmount = this.state.forAmount;
		} else {
			this.stopNowTimer();
			return false;
		}
				
		this.startNowTimer();
    
    if( this.state.showOffers ) {
      this.updateOffers(payload);
    } else {
      this.loadBaseRate(payload);
		}
  }

	async loadBaseRate(payload) {
		/*
		let getBaseRate = await SwapAPI.wsAPIRPC({
			method: 'getSwapBaseRate',
			payload: payload,
			sign: false
    });

    let state;
    if( getBaseRate.data.error === undefined ) {
      state = this.processBaseRateResult(getBaseRate.data);
    } else {
      state = this.processBaseRateResult(false);
    }
    
		this.setState(state);*/
  }

  processBaseRateResult(result) {
    if( result !== false ) {
			if( this.state.editSwapAmount ) {
				let return_amount = result.return_amount;
				return {
					forAmount: return_amount
				}
			} else if( this.state.editForAmount ) {
				let deposit_amount = result.deposit_amount;
				return {
					swapAmount: deposit_amount
				}
			}
		} else {
			if( this.state.editSwapAmount ) {
				return {
					forAmount: ''
				}
			} else if( this.state.editForAmount ) {
        return {
					swapAmount: ''
				}
			}
		}
  }

  async updateOffers (payload) {
		/*
		let getOffers = await SwapAPI.wsAPIRPC({
			method: 'getSwapOffers',
			payload: payload,
			sign: false
    });

    if( getOffers.data.error !== undefined || getOffers.data === undefined ) {
      return false;
    }
    
    let baseRate = getOffers.data.baseRate;
    let offers = getOffers.data.offers;
		let offersExpire = getOffers.data.offersExpire;

    let state = this.processBaseRateResult(baseRate);
    state.offers = offers;
		state.offersExpire = offersExpire;

		this.setState(state);*/
  }
  
  clickViewOffers () {
    this.setState({
      showHomeHeader: false,
      showOffers: true
    }, () => {
      this.update();
    });
	}

	async clickRequestSwap(instanceUUID, hash) {
    let offers = this.state.offers;
		let offer;
		
    for( let off of offers ) {
      if( off.instanceUUID === instanceUUID ) {
        offer = off;
        break;
      }
		}
		
		// is subscribed?
		/*
		if( ! SwapAPI.isSubscribed(`$user:${UserAuthObject.pubKeyHash}`)) {
			console.log('user channel not open?');
			return false;
		}*/

    if( offer === undefined ) return false;
		if( offer.hash !== hash ) return false;

		// Get Next address..
		let toCurrency = offer.to;
		let nextAddress = Wallet.getNextAddress(toCurrency, false);

		if( ! nextAddress ) {
			console.log(`failed to load next address for ${toCurrency}`)
			return false;
		}

		// Submit Swap Request..
		/*
    let requestSwap = await SwapAPI.wsAPIRPC({
      method: 'swap.requestSwap',
      payload: {
				offer: offer,
				toAddress: nextAddress.nextAddress
      },
      sign: true
		});
*/
/*
		if( requestSwap.data.error !== undefined ) {
			return false;
		}

		this.setState({
			requestingSwap: instanceUUID,
			requestSwap: requestSwap.data
		});*/
  }

	render() {
		if( this.state.acceptedSwap !== false ) {
			let redirect = `/track/${this.state.acceptedSwap}`;
			return (<Redirect to={redirect} />);
		}

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
			<div className="singlecolumn">
        {this.state.showHomeHeader && (
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
				<div className="swap">
					<div className="swapamountbar">
						<div className="amountfield">
							<label className={this.state.editSwapAmount ? 'selected' : ''}>Swap</label>
							{this.state.editSwapAmount ? (
								<input type="text" placeholder="0.00000000" value={this.state.swapAmount} onChange={(event) => this.onChangeSwapAmount(event)} disabled={this.state.requestingSwap !== false && true} />
							) : (
								<input type="text" placeholder="0.00000000" value={this.state.swapAmount} readOnly={true} onClick={() => this.editSwapAmount()} disabled={this.state.requestingSwap !== false && true} />
							)}
							<span className="icon"><img src={depositCurrencyMeta.icon} alt={depositCurrency} /></span>
							<span className="select" onClick={() => {this.showCurrencySelector('deposit')}}>{depositCurrency}</span>
						</div>
						<div className="amountfield">
							<label className={this.state.editForAmount ? 'selected' : ''}>For</label>
							{this.state.editForAmount ? (
								<input type="text" placeholder="0.00000000" value={this.state.forAmount} onChange={(event) => this.onChangeForAmount(event)} disabled={this.state.requestingSwap !== false && true} />
							) : (
								<input type="text" placeholder="0.00000000" value={this.state.forAmount} readOnly={true} onClick={() => this.editForAmount()} disabled={this.state.requestingSwap !== false && true} />
							)}
							<span className="icon"><img src={receiveCurrencyMeta.icon} alt={receiveCurrency} /></span>
							<span className="select" onClick={() => {this.showCurrencySelector('receive')}}>{receiveCurrency}</span>
						</div>
						<div className="buttonfield">
              <button disabled={this.state.showOffers ? (true) : (false)} onClick={() => this.clickViewOffers()}>View Offers</button>
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
          {this.state.showOffers && (
          <SwapOfferTable parentState={this.state} currentBalance={currentBalance} onChangeSwapAmount={(a) => this.onChangeSwapAmount(a)} onChangeForAmount={(a) => this.onChangeForAmount(a)} clickRequestSwap={(a,b) => this.clickRequestSwap(a,b)} />
          )}
				</div>
			</div>
			{this.state.showCurrencySelector !== false && (
				<CurrencySelector parentState={this.state} supportedCurrencies={supportedCurrencies} onSelectCurrency={this.onSelectCurrency.bind(this)} hideCurrencySelector={this.hideCurrencySelector.bind(this)} />
			)}
			{this.state.proposingSwap !== false && (
				<SwapProposalModal parentState={this.state} cancelSwapProposal={() => this.cancelSwapProposal()} acceptSwapProposal={() => this.acceptSwapProposal()} />
			)}
			<WalletModalDeposit  close={() => {this.closeDepositModal()}} showDepositModal={this.state.showDepositModal} />
			</>
		)
	}
}


Swap.contextType = WalletContext;
export default Swap;