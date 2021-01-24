import React from 'react';
import date from 'date-and-time';
import { NXMeta } from '../../js/NXSwapTaker';

class TrackOverviewTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render () {
    let loadSwaps = this.props.loadSwaps;
    let listSwaps = loadSwaps.map((swap) => {
      let swap_id = swap.id;
      let key = `${swap_id}`;

      let proposal = swap.proposal;
      let party_a = proposal.party_a;
      let party_b = proposal.party_b;

      let swap_meta = swap.meta;

      let depositCurrency = party_a.currency;
      let receiveCurrency = party_b.currency;

      let depositCurrencyMeta = NXMeta.currencies[depositCurrency];
      let receiveCurrencyMeta = NXMeta.currencies[receiveCurrency];
  
      let depositCurrencyName = depositCurrencyMeta.name.replace( '(Testnet)', '' );
      let receiveCurrencyName = receiveCurrencyMeta.name.replace( '(Testnet)', '' );

      let started = new Date(swap.created);
      let startedDate = date.format(started, 'DD/MM/YYYY');
      let startedTime = date.format(started, 'HH:mm:ss');

      let completed = ( swap.completed !== false && swap.completed > 0 ) ? true : false;

      return (
        <div key={key} className="swapBar">
          <div className="profile">
            <img src="/img/profile-default.png" alt="Profile" />
            {swap_meta.me_party_a ? ( <span>YOU</span> ) : ( <span>3001</span> )}
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
            {swap_meta.me_party_b ? ( <span>YOU</span> ) : ( <span>3001</span> )}
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
            <small>Started</small>
            <span className="small">{startedDate}</span>
            <span className="small">{startedTime}</span>
          </div>
          <div className="metaCol">
            <small>Status</small>
            <span>{completed ? ( <>Completed</> ) : (<>In Progress</>)}</span>
          </div>
          <div className="action">
            <button className="trackSwap" onClick={() => this.props.viewSwap(swap_id)}>View</button>
          </div>
        </div>
      )
    });


    return (
      <>
      {listSwaps}
      </>
    )
  }
}

export default TrackOverviewTable;