import Centrifuge from 'centrifuge';

class NXWS {
  constructor() {
    // ws
    this.nxwsConnected = false;

    // callbacks
    this.setNXWSConnected = false;
    this.setNXWSCurrencies = false;

    // internnal
    this.channels = {}

    // Currencies this version supports. Hardcoded for reasons.
    this.loadedCurrencies = []
    this.supportedCurrencies = ["TBTC", "TLTC", "TVTC"];
  }

  async setupNXWS() {
    this.ws = new Centrifuge("wss://ws-api-dev56.nxswap.com:8000/connection/websocket", {
      debug: true
    });

    this.ws.on('connect', (result) => {
      this.nxwsConnected = true;
      console.log(result);
      this.setNXWSConnected(true);
      this.loadCurrencies();
    });

    // Connect
    this.ws.connect();
  }

  loadCurrencies() {
    // Load from RPC..
    this.ws.rpc({ "method": "loadCurrencies" }).then((res) => {
      var t = Object.values(res);
      this.setCurrencies(t[0]);
      this.channels['currencies'] = this.ws.subscribe('currencies', (message) => {
        this.setCurrencies(message.data);
      });
    }, (err) => {
      console.log('rpc error', err);
    });
  }

  setCurrencies(res) {
    if (Array.isArray(res)) {
      for (let key in res) {
        let value = res[key];
        let ticker = value['ticker'];
        if (!this.supportedCurrencies.includes(ticker)) {
          for (var i = 0; i < res.length; i++) {
            if (res[i]['ticker'] === ticker) {
              res.splice(i, 1);
            }
          }
        }
      }
      this.loadedCurrencies = res;
      console.log(res);
      this.setNXWSCurrencies(this.loadedCurrencies);
    }
  }

  lookupCurrency(ticker) {
    for (const curr of this.loadedCurrencies) {
      if (curr.ticker === ticker) {
        return curr
      }
    }
    return false;
  }
}

export default NXWS;