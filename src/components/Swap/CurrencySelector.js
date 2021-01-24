import React from 'react';
import '../../css/ModalCurrencySelector.css';

function CurrencySelector(props) {
  const onClickBG = (event) => {
    if(event.target.getAttribute('class') === "currencySelectorWindowOverlay") {
      props.hideCurrencySelector();
    }
  }

  let supportedCurrencies = props.supportedCurrencies;

  const listCurrencies = supportedCurrencies.map((currency) => {
    let ticker = currency.ticker;

    let name = currency.name;
    // Fix up testnet
    if( currency.testnet ) {
      name = name.replace( '(Testnet)', '').trim();
    }

    return (
      <div key={ticker} className="currency" onClick={() => props.onSelectCurrency(ticker)}>
        <img className="icon" src={currency.icon} alt={ticker} />
        <span className="name">{name}</span>
        {currency.testnet && (
          <small className="badge">TESTNET</small>
        )}
      </div>
    )
  });

	return (
    <div className="currencySelectorWindowOverlay" onClick={(event) => {onClickBG(event)}} >
      <div className="currencySelector">
        <div className="currencies">
          {listCurrencies}
        </div>
      </div>
    </div>
  )		
}

export default CurrencySelector;