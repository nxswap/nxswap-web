import React from 'react';
import {
	Link
} from "react-router-dom";

import { useRecoveryKeyContext } from "../contexts/RecoveryKeyContext.js"
import { useNegotiatorContext } from "../contexts/NegotiatorContext.js"
import { useWalletContext } from "../contexts/WalletContext.js"


function Header() {
	return (
		<div id="header">
			<div className="max-width">
				<div className="logo">
					<Link to="/"></Link>
				</div>
				<nav>
					<HeaderLinks />
					<a href="https://www.twitter.com/nxswap" rel="noopener noreferrer" target="_blank" className="twitter">&nbsp;</a>
				</nav>
			</div>
		</div>
	)
}


function HeaderLinks() {
	const { recoveryKeyLoading, recoveryKeyLocked, recoveryKeyLoaded } = useRecoveryKeyContext();
	const { activeProposals } = useNegotiatorContext();
	const { loadSwaps } = useWalletContext();

	let linkClass = (recoveryKeyLoading) ? "disabled" : "";

	if (recoveryKeyLoading || (!recoveryKeyLocked && !recoveryKeyLoaded)) {
		return (
			<Link to="/get-started" className={`featured ${linkClass}`}>Get Started</Link>
		)
	} else if (recoveryKeyLoaded && recoveryKeyLocked) {
		return (
			<>
				<Link to="/wallet/unlock" className={`featured ${linkClass}`}>Unlock Wallet</Link>
			</>
		)
	} else if (recoveryKeyLoaded && !recoveryKeyLocked) {
		let proposalCount = 0;

		if( activeProposals !== false && activeProposals !== undefined ) {
			proposalCount = activeProposals.length;
		}

		let proposalClass = (proposalCount > 0 ) ? `featured ${linkClass}` : linkClass;

		let swapCount = 0;

		if( loadSwaps !== undefined && loadSwaps !== false ) {
			swapCount = loadSwaps.length;
		}

		let swapClass = (swapCount > 0 ) ? `featured ${linkClass}` : linkClass;

		return (
			<>
				<Link to="/proposals" className={proposalClass}>Proposals ({proposalCount})</Link>
				<Link to="/track" className={swapClass}>Your Swaps ({swapCount})</Link>
				<Link to="/wallet" className={`${linkClass}`}>Wallet</Link>
				<Link to="/wallet/lock" className={`lock ${linkClass}`}></Link>
			</>
		)
	} else {
		return (
			<></>
		)
	}
}

export default Header;