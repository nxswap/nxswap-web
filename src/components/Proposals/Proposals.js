import React from 'react';
import { NegotiatorContext } from "../../contexts/NegotiatorContext";
import { Negotiator, UserAuthObject } from '../../js/NXSwapTaker';

import ProposalsTable from './ProposalsTable';
import ProposalsTableExpired from './ProposalsTableExpired';

class Proposals extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewSwap: false
    }
  }

  async cancelProposal(id) {
    let cancel = Negotiator.cancelSwapProposal(id);
    if( ! cancel ) return false;
  }

  async trashProposal(id) {
    Negotiator.deleteSwapProposal(id);
  }

  async acceptProposal(id) {
    let accept = Negotiator.acceptSwapProposal(id);
    if( ! accept ) return false;
	}

  async declineProposal(id) {
    let decline = Negotiator.declineSwapProposal(id);
    if( ! decline ) return false;
  }

  viewSwap(requestUUID) {
    this.setState({
      viewSwap: requestUUID
    });
  }

  closeViewSwap() {
    this.setState({
      viewSwap: false
    })
  }

  render () {
    const { activeProposals, expiredProposals } = this.context;
    if( activeProposals === undefined && expiredProposals === undefined ) return false;

    let userAuthorised = (UserAuthObject !== false) ? true : false;
    if( ! userAuthorised ) return false;

    let my_pubkey = UserAuthObject.pubKey;

    return (
      <>
      <div className="splitcolumn top">
        <div className="column marg">
          <div className="trackSwaps">
            <div className="trackSwapsHeader">
              <h3>Active Swap Proposals</h3>
              <span className="desc">Any current proposals that you have received or have made will appear here.</span>
            </div>
            <div className="swapBars">
            { ! activeProposals ? (
              <>
              <div className="swapBar">
                You don't currently have any active proposals.
              </div>
              </>
            ) : (
              <ProposalsTable parent={this.state} activeProposals={activeProposals} my_pubkey={my_pubkey} cancelProposal={(a) => this.cancelProposal(a)} acceptProposal={(a) => this.acceptProposal(a)} declineProposal={(a) => this.declineProposal(a)} />
            )}
            </div>
          </div>
          <div className="trackSwaps">
            <div className="trackSwapsHeader">
              <h3>Expired Swap Proposals</h3>
              <span className="desc">Any expired proposals that you have received or have made will appear here. They are automatically deleted after 1 hour.</span>
            </div>
            <div className="swapBars">
            { ! expiredProposals ? (
              <>
              <div className="swapBar">
                You don't currently have any expired proposals.
              </div>
              </>
            ) : (
              <ProposalsTableExpired parent={this.state} expiredProposals={expiredProposals} my_pubkey={my_pubkey} trashProposal={(a) => this.trashProposal(a)}  />
            )}
            </div>
          </div>
        </div>
      </div>
      </>
    )
  }
}

Proposals.contextType = NegotiatorContext;
export default Proposals;