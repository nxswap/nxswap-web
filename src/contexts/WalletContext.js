import React, { useState, useEffect } from 'react';
import { Wallet } from '../js/NXSwapTaker';

const WalletContext = React.createContext();

const WalletProvider = ({ children }) => {
	const [walletInitialised, setWalletInitialised] = useState(false);
	const [walletBalances, setWalletBalances] = useState(false);
	const [walletUtxos, setWalletUtxos] = useState(false);
	const [loadSwaps, setLoadSwaps] = useState(false);

	useEffect(() => {
    const Setup = async () => {
      setWalletInitialised(Wallet.initialised);
      
			Wallet.on('initialised', (state) => {
				setWalletInitialised(state);
			});

			Wallet.on('balanceUpdate', (state) => {
				setWalletBalances(state);
			});

			Wallet.on('utxoUpdate', (state) => {
				setWalletUtxos(state);
			});

			Wallet.on('loadSwaps', (state) => {
				setLoadSwaps(state);
			})
    };

    Setup();
	}, []);

	return (
		<WalletContext.Provider
			value={{
				walletInitialised,
				walletBalances,
				walletUtxos,
				loadSwaps
			}}
		>
			{children}
		</WalletContext.Provider>
	);
}

function useWalletContext() {
	const context = React.useContext(WalletContext)
	if (context === undefined) {
		throw new Error('WalletContext must be used within a WalletProvider')
	}
	return context
}

export { WalletProvider, useWalletContext, WalletContext, Wallet }