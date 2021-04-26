require('jest-fetch-mock').enableMocks()
const {getExchangeRates} = require( './currencyConvertor');

const mockResponse = {
    "success": true,
    "timestamp": 1619422444,
    "base": "EUR",
    "date": "2021-04-26",
    "rates": {
        "AED": 4.44159,
        "AFN": 94.405615,
        "ALL": 123.077458,
        "AMD": 629.433284,
        "ANG": 2.162147,
    }
}

test('fetchs exchange rates', ()=>{
    fetch.mockResponse(JSON.stringify(mockResponse));
    return getExchangeRates().then(data => {
        expect(data).toStrictEqual(mockResponse.rates);
    });
})