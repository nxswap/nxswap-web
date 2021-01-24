import React from 'react';
import {
  Redirect
} from "react-router-dom";
import { WalletContext } from "../../contexts/WalletContext";
import { Wallet, UserAuthObject } from '../../js/NXSwapTaker';

import TrackOverviewTable from './TrackOverviewTable';
import TrackDetailModal from './TrackDetailModal';

class TrackOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewSwap: false
    }

    let match = this.props.match;
    let params = match.params;

    if( params.id !== false ) {
      this.state.viewSwap = params.id;
    }
  }

  viewSwap(id) {
    this.setState({
      viewSwap: id
    });
  }

  closeViewSwap() {
    this.setState({
      viewSwap: false
    })
  }

  returnEmptySwapDB () {
    return (
      <>
      you don't have any swaps to track bro.
      </>
    )
  }

  render () {
    const { loadSwaps } = this.context;
    if( loadSwaps === undefined ) return false;

    let userAuthorised = (UserAuthObject !== false) ? true : false;
    if( ! userAuthorised ) return false;

    let match = this.props.match;
    let params = match.params;

    if( params.id !== undefined ) {
      if( params.id !== this.state.viewSwap ) {
        return (<Redirect to="/track" />)
      }
    }

    let loadSwap = false;

    if( this.state.viewSwap !== undefined && this.state.viewSwap !== false ) {
      console.log('load swap', this.state.viewSwap)

      for( let sid in loadSwaps ) {
        let s = loadSwaps[sid];
        if(s.id === this.state.viewSwap ) {
          loadSwap = s;
          break;
        }
      }
    }

    return (
      <>
      <div className="singlecolumn">
      {!loadSwaps ? this.returnEmptySwapDB() 
      : (
        <div className="trackSwaps">
          <div className="trackSwapsHeader">
            <h3>Track Your Swaps</h3>
            <span className="desc">Here you can track the status and see a history of your Swaps. If a Swap requires your attention, you must View the Swap so that it can continue.</span>
          </div>
          <div className="swapRows">
          <TrackOverviewTable parent={this.state} loadSwaps={loadSwaps} viewSwap={(a) => this.viewSwap(a)} />
          </div>
        </div>
      )}
      </div>
      {this.state.viewSwap !== false && (
        <TrackDetailModal parent={this.state} loadSwap={loadSwap} closeViewSwap={() => this.closeViewSwap()} />
      )}
      </>
    )
  }
}

TrackOverview.contextType = WalletContext;
export default TrackOverview;