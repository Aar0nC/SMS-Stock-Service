'use strict';

const http = require('request-promise');
const url = require('url');
const co = require('co');
const APP_ID = process.env.CURRENCY_APP_ID;
const stockAPIHost = process.env.STOCK_API_HOST;
const stockAPIEndpoint = process.env.STOCK_API_ENDPOINT;

var getStockQuote = co.wrap(function *getStockQuote(stockSymbol) {
    const urlObj = {
        protocol: 'https',
        host: stockAPIHost,
        pathname: stockAPIEndpoint,
        search: '?q=' + stockSymbol
    };
    const urlString = url.format(urlObj);
    const data = yield http(urlString).catch(function (err) {
        console.log(err);
        //throw new Error('Hmmm we couldn\'t find ' + stockSymbol + '. Please make sure you have the right symbol');
    });
    let response = new Buffer(data).toString('ascii');
    response = response.replace('//', '');
    return JSON.parse(response)[0];
});

var getExchangeRate = co.wrap(function *getExchangeRate(currencySymbol) {
    const urlObj = {
        protocol: 'https',
        host: 'openexchangerates.org', //this is a better feed, updates every hour
        pathname: '/api/latest.json',
        search: '?app_id='+APP_ID
    };
    const urlString = url.format(urlObj);
    const exchangeRatesString = yield http(urlString).catch(function (err) {
        console.log(err);
    });
    const exchangeRates = JSON.parse(exchangeRatesString);
    let exchangeRate = exchangeRates.rates[currencySymbol];
    exchangeRate = (1.0 / exchangeRate).toFixed(4); //flip the base and format
    return exchangeRate;
});

var getMarketData = co.wrap(function *getStockData(stockSymbols, currencySymbols) {
    console.log('Getting stock market data');
    let marketDataString = '';
    for (let i = 0; i < stockSymbols.length; i++) {
        const stock = stockSymbols[i].symbol;
        let stockQuote = yield getStockQuote(stock);
        marketDataString += stockSymbols[i].name + '(' + stockQuote.t.replace('.', '') + ')' + ': ' + stockQuote.l +  ' (' + stockQuote.cp
        + '%)' + '\n';
    }
    for (let i = 0; i < currencySymbols.length; i++) {
        const currency = currencySymbols[i];
        let exchangeRate = yield getExchangeRate(currency);
        marketDataString += currency + ': ' + exchangeRate + ' USD' + '\n';
    }
    return marketDataString;
});

module.exports = {
    getMarketData
};