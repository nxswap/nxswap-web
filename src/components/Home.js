import React from 'react';
import {
  Link
} from "react-router-dom";
import { SwapAPI, NXMeta } from '../js/NXSwapTaker';


import '../css/Swap.css';

import CurrencySelector from './Swap/CurrencySelector';

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			depositCurrency: 'TBTC',
			receiveCurrency: 'TVTC',
			swapAmount: '',
			forAmount: '',
			showCurrencySelector: false,
			showCurrencySelectorFor: false,
			editSwapAmount: true,
			editForAmount: false
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
			this.updateBaseRate();
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

	async onChangeSwapAmount(event) {
		let swapAmount = event.target.value;
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
			swapAmount: swapAmount
		}, () => {
			this.updateBaseRate();
		})
	}

	async onChangeForAmount(event) {
		let forAmount = event.target.value;
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
			forAmount: forAmount
		})

		this.setState({
			forAmount: forAmount
		}, () => {
			this.updateBaseRate();
		})
	}

	async updateBaseRate() {
		let payload = {
			from: this.state.depositCurrency,
			to: this.state.receiveCurrency,
		}

		if(this.state.editSwapAmount && ! isNaN(this.state.swapAmount) && this.state.swapAmount > 0) {
			payload.fromAmount = this.state.swapAmount;
		} else if( this.state.editForAmount && ! isNaN(this.state.forAmount) && this.state.forAmount > 0 ) {
			payload.toAmount = this.state.forAmount;
		} else {
			return false;
		}

		let getBaseRate = await SwapAPI.wsAPIRPC({
			method: 'getSwapBaseRate',
			payload: payload,
			sign: false
		});

		if( getBaseRate.data.error === undefined ) {
			let data = getBaseRate.data;
			if( this.state.editSwapAmount ) {
				let return_amount = data.return_amount;
				this.setState({
					forAmount: return_amount
				})
			} else if( this.state.editForAmount ) {
				let deposit_amount = data.deposit_amount;
				this.setState({
					swapAmount: deposit_amount
				})
			}
		} else {
			if( this.state.editSwapAmount ) {
				this.setState({
					forAmount: ''
				})
			} else if( this.state.editForAmount ) {
				this.setState({
					swapAmount: ''
				})
			}
		}
	}

	render() {
		let supportedCurrencies = [];
		for( let tick in NXMeta.currencies ) {
			supportedCurrencies.push(NXMeta.currencies[tick]);
		}

		//let currencyAvailability = [];

		let depositCurrency = this.state.depositCurrency;
		let receiveCurrency = this.state.receiveCurrency;

		let depositCurrencyMeta = NXMeta.currencies[depositCurrency];
		let receiveCurrencyMeta = NXMeta.currencies[receiveCurrency];

		return (
			<>
			<div className="singlecolumn">
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
				<div className="swap">
					<div className="swapamountbar">
						<div className="amountfield">
							<label className={this.state.editSwapAmount ? 'selected' : ''}>Swap</label>
							{this.state.editSwapAmount ? (
								<input type="text" placeholder="0.00000000" value={this.state.swapAmount} onChange={(event) => this.onChangeSwapAmount(event)} />
							) : (
								<input type="text" placeholder="0.00000000" value={this.state.swapAmount} readOnly={true} onClick={() => this.editSwapAmount()} />
							)}
							<span className="icon"><img src={depositCurrencyMeta.icon} alt={depositCurrency} /></span>
							<span className="select" onClick={() => {this.showCurrencySelector('deposit')}}>{depositCurrency}</span>
						</div>
						<div className="amountfield">
							<label className={this.state.editForAmount ? 'selected' : ''}>For</label>
							{this.state.editForAmount ? (
								<input type="text" placeholder="0.00000000" value={this.state.forAmount} onChange={(event) => this.onChangeForAmount(event)} />
							) : (
								<input type="text" placeholder="0.00000000" value={this.state.forAmount} readOnly={true} onClick={() => this.editForAmount()} />
							)}
							<span className="icon"><img src={receiveCurrencyMeta.icon} alt={receiveCurrency} /></span>
							<span className="select" onClick={() => {this.showCurrencySelector('receive')}}>{receiveCurrency}</span>
						</div>
						<div className="buttonfield">
							<Link to="/swap">Swap</Link>
						</div>
					</div>
				</div>
			</div>
			{this.state.showCurrencySelector !== false && (
				<CurrencySelector parentState={this.state} supportedCurrencies={supportedCurrencies} onSelectCurrency={this.onSelectCurrency.bind(this)} hideCurrencySelector={this.hideCurrencySelector.bind(this)} />
			)}
			</>
		)
	}
}

export default Home;