import React from 'react';
import { NXMeta } from '../../js/NXSwapTaker';

class ProposalsTableExpired extends React.Component {
  
  render () {
    let expiredProposals = this.props.expiredProposals;

    if( ! expiredProposals ) return false;

    let listProposals = expiredProposals.map((proposal) => {
      let proposal_id = proposal.id;
      let key = `${proposal_id}`;

      let party_a = proposal.party_a;
      let party_b = proposal.party_b;

      let depositCurrency = party_a.currency;
      let receiveCurrency = party_b.currency;

      let depositCurrencyMeta = NXMeta.currencies[depositCurrency];
      let receiveCurrencyMeta = NXMeta.currencies[receiveCurrency];
  
      let depositCurrencyName = depositCurrencyMeta.name.replace( '(Testnet)', '' );
      let receiveCurrencyName = receiveCurrencyMeta.name.replace( '(Testnet)', '' );

      return (
        <div key={key} className="swapBar">
            <div className="profile">
              <img src="/img/profile-default.png" alt="Profile" />
              {proposal.role === 'maker' ? ( <span>YOU</span> ) : ( <span>3001</span> )}
            </div>
            <div className="currencySelect">
              <span>Swap<small>{depositCurrencyName}</small></span>
              <img src={depositCurrencyMeta.icon} alt={depositCurrency} />
            </div>
            <div className="metaCol">
              <small>{depositCurrency} Amount</small>
              <span>{proposal.party_a.amount}</span>
            </div>
            <div className="currencyArrow">
              <img src="/img/arrow-right.png" alt=">" />
            </div>
            <div className="profile">
              <img src="/img/profile-default.png" alt="Profile" />
              {proposal.role === 'taker' ? ( <span>YOU</span> ) : ( <span>3001</span> )}
            </div>
            <div className="currencySelect">
              <span>For<small>{receiveCurrencyName}</small></span>
              <img src={receiveCurrencyMeta.icon} alt={receiveCurrency} />
            </div>
            <div className="metaCol">
              <small>{receiveCurrency} Amount</small>
              <span>{proposal.party_b.amount}</span>
            </div>
            <div className="metaCol">
              <span>Expired</span>
            </div>
            <div className="action">
              <button className="trackSwap" onClick={() => this.props.trashProposal(proposal_id)}>Delete</button>
            </div>
          </div>
      )
    });

    return (
      <>
      {listProposals}
      </>
    )
  }
}

export default ProposalsTableExpired;