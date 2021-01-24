import React from 'react';
import { NXMeta } from '../../js/NXSwapTaker';

class ProposalsTable extends React.Component {
  
  render () {
    let activeProposals = this.props.activeProposals;
    if( ! activeProposals ) return false;

    let listProposals = activeProposals.map((proposal) => {
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

      let expires = proposal.party_a.expires;
      let negotiating = proposal.negotiating;

      if( negotiating !== undefined && negotiating !== false ) {
        expires = proposal.party_b.expires;
      }
      
      let now = new Date().getTime();
      let diff = expires - now;
      let seconds = Math.round(diff / 1000);

      return (
        <div key={key} className="swapBar">
            <div className="profile">
              <img src="/img/profile-default.png" alt="Profile" />
              {proposal.me_party_a ? ( <span>YOU</span> ) : ( <span>3001</span> )}
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
              {proposal.me_party_b ? ( <span>YOU</span> ) : ( <span>3001</span> )}
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
              <small>Expires In</small>
              <span>{seconds}</span>
            </div>
            {negotiating && (
              <>
              <div className="action">
                <span className="info">Negotiation<br />In Progress</span>
              </div>
              </>
            )}
            {!negotiating && proposal.me_party_b && (
              <>
              <div className="action">
                <button className="trackSwap" onClick={() => this.props.acceptProposal(proposal_id)}>Accept</button>
              </div>
              <div className="action">
                <button className="trackSwap" onClick={() => this.props.declineProposal(proposal_id)}>Decline</button>
              </div>
              </>
            )}
            {!negotiating && proposal.me_party_a && (
              <>
              <div className="action">
              <span className="info">Awaiting<br />Response</span>
              </div>
              <div className="action">
              <button className="trackSwap" onClick={() => this.props.cancelProposal(proposal_id)}>Cancel</button>
              </div>
              </>
            )}
            
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

export default ProposalsTable;