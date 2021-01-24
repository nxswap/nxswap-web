import React from 'react';
import { Wallet, NXMeta } from '../../js/NXSwapTaker';

import '../../css/Modal.css';

class WalletModalTransactions extends React.Component {
  render () {
    let curr = this.props.showTransactionsModal;
    if( ! curr ) return false;
    
    let meta = NXMeta.currencies[curr];

    const onClickBG = (event) => {
      let target = event.target;
      let targetClass = target.getAttribute('class');

      if(targetClass === "modalWindowOverlay") {
        this.props.close();
      }
    }

    // This will auto update on block refreshes, no context needed..
    // txids are sorted, transactions are not.
    
    let getTxids = Wallet.txids[curr];
    let getLedger = Wallet.transactionLedger[curr];


    const displayTransactions = getTxids.map((txid) => {
      if( getLedger[txid] === undefined ) return false;
      let ledger = getLedger[txid];
      let key = ledger.hash;
      
      //let adjFormat = Wallet.formatBalanceDecimals(tx.adj, 100000000, 8);

      let adjClass = (ledger.adj > 0 ) ? "adj pos" : "adj neg";
      return (
        <tr key={key}>
          <td className="date">{ledger.when}</td>
          <td className="type">{ledger.descType}</td>
          <td className="descr">{ledger.desc}</td>
          <td className={adjClass}>{ledger.adjFormatted}</td>
        </tr>
      )
    });

    return (
      <div className="modalWindowOverlay" onClick={(event) => {onClickBG(event)}} >
        <div className="modalWindow wide">
          <div className="modalHeader">
            <img src={meta.icon} alt={curr} />
            <h3>{meta.name} Transactions</h3>
            <span className="close" onClick={() => this.props.close()}>
              <img src="/img/close.svg" alt="Close" />
            </span>
          </div>
          <div className="modalTable">
          <table className="transactions" cellPadding="0" cellSpacing="0">
            <thead>
              <tr>
                <th className="date">Date</th>
                <th className="type">Type</th>
                <th className="descr">Notes</th>
                <th className="adj">{curr} +/-</th>
              </tr>
            </thead>
            <tbody>
              {displayTransactions}
            </tbody> 
          </table>
          </div>
        </div>
      </div>
    )
  }
}

export default WalletModalTransactions;