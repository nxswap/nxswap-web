import React from 'react';
import {
	Link,
} from "react-router-dom";

class Footer extends React.Component {

	render() {
		return (
			<div id="footer">
				<div className="max-width">
					<div className="left">
						<Link to="/propose">Propose A Swap</Link>
					</div>
					<div className="right">
						<a href="https://www.github.com/nxswap/" target="_blank" rel="noopener noreferrer">Open Source - View on GitHub</a>
					</div>
				</div>
			</div>
		)
	}
}

export default Footer;