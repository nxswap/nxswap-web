import TrezorConnect, { DEVICE_EVENT, DEVICE, UI_EVENT } from 'trezor-connect';


TrezorConnect.init({
	connectSrc: 'https://localhost:8088/',
	manifest: {
		email: 'info@nxswap.com',
		appUrl: 'https://www.nxswap.com'
	},
	popup: false,
	debug: false,
}).then(() => {
	console.log('init');
}).catch(error => {
			console.log('TrezorConnect init error', error);
	});

async function test () {
	TrezorConnect.cipherKeyValue({
    path: "m/49'/0'/0'",
    key: "This text is displayed on Trezor during encrypt",
    value: "1c0ffeec0ffeec0ffeec0ffeec0ffee1",
    encrypt: true,
    askOnEncrypt: true,
    askOnDecrypt: true
}).then( (result) => {
	console.log('cipher');
	console.log(result);
}).catch(error => {
	console.log('TrezorConnect init error', error);
});

}

TrezorConnect.on(DEVICE_EVENT, (event) => {
	console.log('event!');
	console.log(event);
	if (event.type === DEVICE.CONNECT) {
		
	} else if (event.type === DEVICE.DISCONNECT) {

	}
});

TrezorConnect.on(UI_EVENT, (event) => {
	console.log('UI event!');
	console.log(event);
//	test();
});