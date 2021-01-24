import React, { useState, useEffect } from 'react';
import { RecoveryKey } from '../js/NXSwapTaker';

const RecoveryKeyContext = React.createContext();

const RecoveryKeyProvider = ({ children }) => {
	const [recoveryKeyLoading, setRecoveryKeyLoading] = useState(true);
	const [recoveryKeyLocked, setRecoveryKeyLocked] = useState(false);
	const [recoveryKeyLoaded, setRecoveryKeyLoaded] = useState(false);

	useEffect(() => {
    const Setup = async () => {
			setRecoveryKeyLoading(RecoveryKey.recoveryKeyLoading);
			setRecoveryKeyLocked(RecoveryKey.recoveryKeyLocked);
			setRecoveryKeyLoaded(RecoveryKey.recoveryKeyLoaded);

			RecoveryKey.on('loading', (state) => {
				setRecoveryKeyLoading(state);
			});

			RecoveryKey.on('locked', (state) => {
				setRecoveryKeyLocked(state);
			});

      RecoveryKey.on('loaded', (state) => {
				setRecoveryKeyLoaded(state);
			});
    };

    Setup();
	}, []);

	return (
		<RecoveryKeyContext.Provider
			value={{
				recoveryKeyLoading,
				recoveryKeyLocked,
				recoveryKeyLoaded
			}}
		>
			{children}
		</RecoveryKeyContext.Provider>
	);
}

function useRecoveryKeyContext() {
	const context = React.useContext(RecoveryKeyContext)
	if (context === undefined) {
		throw new Error('RecoveryKeyContext must be used within a RecoveryKeyProvider')
	}
	return context
}

export { RecoveryKeyProvider, useRecoveryKeyContext, RecoveryKeyContext, RecoveryKey }