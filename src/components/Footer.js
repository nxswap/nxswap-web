import React from 'react';
import {
	Link,
} from "react-router-dom";

class Footer extends React.Component {

	render() {
		let currentRepo = ( process.env.NODE_ENV === "production" ) ? `${process.env.REACT_APP_NOW_GITHUB_REPO}/${process.env.REACT_APP_NOW_GITHUB_COMMIT_REF}` : "DEV VERSION";
		let currentRepoURL = (process.env.NODE_ENV === "production" ) ? `https://www.github.com/nxswap/${process.env.REACT_APP_NOW_GITHUB_REPO}/tree/${process.env.REACT_APP_NOW_GITHUB_COMMIT_REF}` : "https://www.github.com/nxswap/nxswap-taker";
		return (
			<div id="footer">
				<div className="max-width">
					<div className="left">
						<Link to="/request">Request A Swap</Link>
						<span>|</span>
						<Link to="/propose">Propose A Swap</Link>
						<span>|</span>
						<Link to="/market-makers">Market Makers</Link>
					</div>
					<div className="right">
						<Link to="/security">Security</Link>
						<span>|</span>
						<a href={currentRepoURL} target="_blank" rel="noopener noreferrer">Open Source - {currentRepo}</a>
					</div>
				</div>
			</div>
		)
	}
}

export default Footer;