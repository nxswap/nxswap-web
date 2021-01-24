import React from 'react';
import { Wallet, NXMeta } from '../../js/NXSwapTaker';

import '../../css/Modal.css';
import { WalletContext } from '../../contexts/WalletContext';

class WalletModalWithdraw extends React.Component {
  constructor(props) {
    super(props);
    this.defaultState = {
      curr: false,
      success: false,
      successTxid: false,
      isConfirm: false,
      isConfirmEnabled: false,
      isSelectInputs: false,
      sendToAddress: false,
      validSendToAddress: false,
      sendAmount: false,
      sendAmountInvalid: false,
      selectedInputs: false,
      sendFee: 'high',
      subtractFee: false
    }
    this.state = this.defaultState;
  }

  close() {
    this.setState(this.defaultState);
    this.props.close();
  }

  addressFieldChange(event, curr) {
    let address = event.target.value;
    let validAddress = false;

    if (address.length > 0) {
      validAddress = Wallet.validateCryptoAddress(address, curr);
    }

    this.setState({
      curr: curr,
      sendToAddress: address,
      validSendToAddress: validAddress
    });
  }

  amountFieldChange(event, maximumAmountFloat) {
    let amount = event.target.value;
    if (!amount || amount === undefined || amount < 0) {
      amount = false;
    }

    let subtractFee = this.state.subtractFee;

    if (parseFloat(amount) === maximumAmountFloat) {
      subtractFee = true;
    }

    let sendAmountInvalid = false;

    if( ( amount > 0 && maximumAmountFloat === 0 ) || ( parseFloat(amount) > maximumAmountFloat ) ) {
      sendAmountInvalid = true;
    }

    this.setState({
      sendAmount: amount,
      subtractFee: subtractFee,
      sendAmountInvalid: sendAmountInvalid
    });
  }

  SendMax(maximumAmountFloat) {
    if (maximumAmountFloat > 0) {
      this.setState({
        sendAmount: maximumAmountFloat,
        subtractFee: true,
        sendAmountInvalid: false
      });
    }
  }

  selectFee(fee) {
    this.setState({
      sendFee: fee
    });
  }

  toggleSubtractFeeFromAmount(maximumAmountFloat) {
    let amount = this.state.sendAmount;
    let subtract = this.state.subtractFee;

    if (!subtract) {
      this.setState({ subtractFee: true });
    } else {
      if (parseFloat(amount) !== maximumAmountFloat) {
        // Can only false, if amount to send is less than the balance..
        this.setState({ subtractFee: false });
      }
    }
  }

  CustomSelectFee() {
    let selected = this.state.sendFee;
    let options = [
      {
        id: 'low',
        label: 'Low',
      },
      {
        id: 'medium',
        label: 'Medium'
      },
      {
        id: 'high',
        label: 'High'
      }
    ];

    for (let optionKey in options) {
      let option = options[optionKey];
      if (option.id === selected) {
        options[optionKey].class = "customSelectOption selected";
      } else {
        options[optionKey].class = "customSelectOption";
      }
    }

    const listOptions = options.map((option) => {
      return (
        <span className={option.class} key={option.id} onClick={() => this.selectFee(option.id)}>
          {option.label}
        </span>
      )
    });

    return (
      <div className="customSelect">
        {listOptions}
      </div>
    )
  }

  WithdrawForm(curr, meta, availableBalance) {
    let isConfirm = this.state.isConfirm;
    let isConfirmDisabled = this.state.isConfirmDisabled;
    let disableConfirm = (isConfirmDisabled !== false) ? true : false;
    // select inputs..
    let hasSelectedInputs = (this.state.selectedInputs !== false ) ? true : false;
    let selectedInputsValue = 0;
    let selectedInputsValueFormat = false;

    if(hasSelectedInputs) {
      for( let input of this.state.selectedInputs) {
        let exp = input.split('-');
        let value = exp[2];
        selectedInputsValue += parseInt(value);
      }
      selectedInputsValueFormat = Wallet.formatBalanceDecimals(selectedInputsValue, 100000000, 8);
    }

    let selectInputsText = (hasSelectedInputs) ? `Select Inputs (${this.state.selectedInputs.length} Selected, Total Value ${selectedInputsValueFormat})` : "Select Inputs (Auto)";

    // Work out selected max...
    let maximumAmountFloat = availableBalance.float;

    if( hasSelectedInputs ) {
      maximumAmountFloat = parseFloat(selectedInputsValueFormat);
    }

    let sendToAddress = (this.state.sendToAddress === false) ? "" : this.state.sendToAddress;
    let sendAmount = "";
    if (this.state.sendAmount !== false) {
      sendAmount = this.state.sendAmount;
    }

    let sendAmountInputClass = "";
    if( this.state.sendAmountInvalid || ( sendAmount > 0 && sendAmount > maximumAmountFloat ) ) {
      sendAmountInputClass = "error";
    }

    let isMax = (parseFloat(sendAmount) === maximumAmountFloat) ? true : false;
    let maxClass = (isMax) ? "amountMax active" : "amountMax";

    let addressPlaceholder = `Enter ${curr} Address`;
    let addressError = (this.state.validSendToAddress || !this.state.sendToAddress) ? false : true;
    let addressInputClass = "";
    if (addressError) {
      addressInputClass = "error";
    }    

    let subtractFeeSelectedClass = (this.state.subtractFee) ? "customCheck textRight selected" : "customCheck textRight";
    let subtractFeeActionClass = (this.state.subtractFee) ? "labelAction active" : "labelAction";
    let SendDisabled = (this.state.validSendToAddress && sendAmount > 0 && sendAmount <= maximumAmountFloat) ? false : true;
    this.canSend = (SendDisabled) ? false : true;
    let variableFee = meta.variableFee;

    // Calc Fee..
    let transactionFee = false;
    let inputs = false;
    let outputs = false;

    if( ! SendDisabled ) {
      let sendSatoshis = parseInt(this.state.sendAmount * 100000000);
      outputs = (isMax) ? [{ address: this.state.sendToAddress }] : [{ address: this.state.sendToAddress, value: sendSatoshis }];
      // INputs?
      if( hasSelectedInputs ) {
        inputs = this.state.selectedInputs;
      }
      let estimateFee = Wallet.calculateTransactionFee(curr, inputs, outputs, false);
      if( estimateFee !== false ) {
        transactionFee = parseFloat(estimateFee.fee / 100000000);
      }
    }

    let modalInputClass = (isConfirm) ? "modalInput disabled" : "modalInput";

    return (
      <>
      <div className={modalInputClass}>
        <label htmlFor="sendToAddress">
          <span>Send To Address</span>
          {addressError && (
            <span className="labelError">Invalid {curr} Address</span>
          )}
        </label>
        <input id="sendToAddress" className={addressInputClass} onChange={(event) => this.addressFieldChange(event, curr)} name="sendToAddress" type="text" value={sendToAddress} placeholder={addressPlaceholder} spellCheck={false} disabled={isConfirm} />
      </div>
      <div className={modalInputClass}>
        <label htmlFor="sendAmount">
          <span>Amount</span>
          <span className="labelAction" onClick={() => this.showSelectInputs(true)}>{selectInputsText}</span>
        </label>
        <input onChange={(event) => this.amountFieldChange(event, maximumAmountFloat)} id="sendAmount" name="sendAmount" type="text" value={sendAmount} placeholder="Send Amount" className={sendAmountInputClass} disabled={isConfirm} />
        
        <span className="inputAction"><span className={maxClass} onClick={() => this.SendMax(maximumAmountFloat)}>Send Max</span></span>
      </div>
      <div className={modalInputClass}>
        <label htmlFor="sendAmount">
          <span>Transaction Fee
            {transactionFee !== false && (
            <small>{transactionFee} {curr}</small>
            )}
            </span>
          <span className={subtractFeeActionClass} onClick={() => this.toggleSubtractFeeFromAmount(maximumAmountFloat)}><span className={subtractFeeSelectedClass}>&nbsp;</span>Subtract Fee From Amount</span>
        </label>
        {variableFee && (
          this.CustomSelectFee()
        )}
      </div>
      {isConfirm ? (
        <>
        <div className="modalAction">
          <button className="cancel" onClick={(event) => this.clickCancelSend(event)}>Cancel Send</button>
          <button className="confirm" onClick={(event) => this.clickConfirmSend(event, curr, inputs, outputs, false)} disabled={disableConfirm}>Confirm Send {isConfirmDisabled !== false && (<>({isConfirmDisabled})</>)}</button>
        </div> 
        </>
      ) : (
        <div className="modalAction">
          <button disabled={SendDisabled} onClick={(event) => this.clickSend(event, curr, inputs, outputs, false)}>Send</button>
        </div>        
      )}
      </>
    )
  }

  async clickSend (event) {
    event.preventDefault();
    if( !this.canSend) return false;

    this.setState({
      isConfirm: true,
      isConfirmDisabled: 3
    });

    this.confirmInterval = setInterval(() => {
      let currentTimeout = this.state.isConfirmDisabled;
      if( currentTimeout === 1 ) {
        currentTimeout = false;
        clearInterval(this.confirmInterval);
      } else {
        currentTimeout -= 1;
      }
      if( this.state.isConfirm) {
        this.setState({
          isConfirm: true,
          isConfirmDisabled: currentTimeout
        })
      }
    }, 1000);
  }

  async clickCancelSend (event) {
    event.preventDefault();

    this.setState({
      isConfirm: false
    });
  }

  async clickConfirmSend(event, curr, inputs, outputs) {
    event.preventDefault();
    if( !this.canSend) return false;

    let create = Wallet.createSendTransaction(curr, inputs, outputs, false);
    if( ! create ) return false;

    let send = await Wallet.sendTransaction(curr, create);
    if( send !== false ) {
      this.setState({
        success: true,
        successTxid: send
      });
    }
  }

  showSelectInputs(state) {
    this.setState({
      isSelectInputs: state
    });
  }

  toggleSelectedInput(key) {
    if( !this.state.selectedInputs ) {
      this.addSelectedInput(key);
      return;
    }

    if( this.state.selectedInputs.includes(key) ) {
      this.removeSelectedInput(key);
    } else {
      this.addSelectedInput(key);
    }
  }

  addSelectedInput(key) {
    let inputs = this.state.selectedInputs;
    if( !inputs ) inputs = [];
    inputs.push(key);
    this.setState({
      selectedInputs: inputs
    });
  }

  removeSelectedInput(key) {
    let inputs = this.state.selectedInputs;
    let index = inputs.indexOf(key);
    if( index > -1 ) {
      inputs.splice(index, 1);
    }

    if( inputs.length === 0 ) {
      inputs = false;
    }

    this.setState({
      selectedInputs: inputs
    });
  }

  WithdrawSelectInputs(utxos) {
    if( !utxos || utxos.length === 0) {
      return false;
    }

    let selectedInputs = this.state.selectedInputs;
    if( ! selectedInputs ) selectedInputs = [];

    const listUtxos = utxos.map((utxo) => {
      let key = `${utxo.txid}-${utxo.vout}-${utxo.value}`;

      let selected = selectedInputs.includes(key) ? true : false;
      let checkClass = (selected) ? "customCheck selected" : "customCheck";

      let value = Wallet.formatBalanceDecimals(utxo.value, 100000000, 8);
      return (
        <tr key={key}>
          <td className="checkbox"><span onClick={() => this.toggleSelectedInput(key)} className={checkClass}>&nbsp;</span></td>
          <td className="address">{utxo.address}</td>
          <td className="value">{value}</td>
        </tr>
      )
    });

    return (
      <>
      <div className="modalContent">
        <small className="label">
          <span>Select Inputs</span>
          <span className="labelAction" onClick={() => this.showSelectInputs(false)}>Close Input Selection</span></small>
      </div>
      <div className="modalTable">
        <table className="utxos" cellPadding="0" cellSpacing="0">
          <thead>
            <tr>
              <th className="checkbox">&nbsp;</th>
              <th className="address">Address</th>
              <th className="value">Value</th>
            </tr>
          </thead>
          <tbody>
            {listUtxos}
          </tbody> 
        </table>
      </div>
      </>
    )
  }

  WithdrawSuccess (curr, meta) {
    return (
      <div className="modalWindowOverlay">
        <div className="modalWindow">
        <div className="modalHeader">
          <img src={meta.icon} alt={curr} />
          <h3>{meta.name} Transaction Sent</h3>
          <span className="close" onClick={() => this.close()}>
            <img src="/img/close.svg" alt="Close" />
          </span>
        </div>
        <div className="modalContent">
          <small className="label">
            <span>Success! Your transaction has been broadcast. Your transaction ID is below.</span>
          </small>
        </div>
        <div className="modalContent">
          <small className="label">
            <span>{this.state.successTxid}</span>
          </small>
        </div>
        </div>
      </div>
    )
  }

  render() {
    const { walletBalances, walletUtxos } = this.context;
    let curr = this.props.showWithdrawModal;
    if (!curr) return false;

    let utxos = walletUtxos[curr];
    let meta = NXMeta.currencies[curr];
    let availableBalance = walletBalances[curr].available;
    let pendingBalance = walletBalances[curr].pending;
    let withdrawContent;

    if(this.state.success) {
      return this.WithdrawSuccess(curr, meta);
    } else {
      if( this.state.isSelectInputs ) {
        withdrawContent = this.WithdrawSelectInputs(utxos);
      } else {
        withdrawContent = this.WithdrawForm(curr, meta, availableBalance);
      }
    }
    

    return (
      <div className="modalWindowOverlay">
        <div className="modalWindow">
        <div className="modalHeader">
          <img src={meta.icon} alt={curr} />
          <h3>Withdraw {meta.name}<small>Available {availableBalance.formatted}
          {pendingBalance.raw > 0 && (
            <> / Pending {pendingBalance.formatted}</>
          )}</small></h3>
          <span className="close" onClick={() => this.close()}>
            <img src="/img/close.svg" alt="Close" />
          </span>
        </div>
        {withdrawContent}
        </div>
      </div>
    )
  }
}

WalletModalWithdraw.contextType = WalletContext;
export default WalletModalWithdraw;