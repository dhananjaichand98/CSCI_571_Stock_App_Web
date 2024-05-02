const express = require('express'), bodyParser = require("body-parser");
const axios = require('axios');
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors({"origin": "*"}));

const finhub_key = 'c80uijqad3ie5egtf3sg';

app.get('/company-description', (req, res) => {

    params = req.query;
    url = 'https://finnhub.io/api/v1/stock/profile2';
    axios.get(url, {
        params: {...params, 'token':finhub_key} // symbol & token
    })
    .then(function (response) {
        res.json(response.data);
    })
    .catch(function (error){

        if(error.response.data){
            return res.json({errorData: error.message});
        }

        res.json({})
    });

});

app.get('/company-history', (req, res) => {

    params = req.query;
    url = 'https://finnhub.io/api/v1/stock/candle';
    axios.get(url, {
        params: {...params, 'token':finhub_key}
    })
    .then(function (response) {
        res.json(response.data);
    })
    .catch(function (error){
        res.json({})
    });

});

app.get('/company-stock-price', (req, res) => {

    params = req.query;
    url = 'https://finnhub.io/api/v1/quote';
    axios.get(url, {
        params: {...params, 'token':finhub_key}
    })
    .then(function (response) {
        res.json(response.data);
    })
    .catch(function (error){

        if(error.response.data){
            return res.json({errorData: error.message});
        }

        res.json({})
    });

});

app.get('/company-symbol-query', (req, res) => {

    params = req.query;
    url = 'https://finnhub.io/api/v1/search';
    axios.get(url, {
        params: {...params, 'token':finhub_key}
    })
    .then(function (response) {
        res.json(response.data);
    })
    .catch(function (error){
        res.json({})
    });

});

app.get('/company-news', (req, res) => {

    params = req.query;
    url = 'https://finnhub.io/api/v1/company-news';
    axios.get(url, {
        params: {...params, 'token':finhub_key}
    })
    .then(function (response) {
        res.json(response.data);
    })
    .catch(function (error){
        res.json({})
    });

});

function getRecommendationData(response){
    let result = {
        'strongBuy': [],
        'buy': [],
        'hold': [],
        'sell': [],
        'strongSell': [],
        'symbol': response.data[0].symbol,
        'xcateg':  [] 
    }
    for(let i=0; i<response.data.length; i++){
      result['strongBuy'].push(response.data[i].strongBuy)
      result['strongSell'].push(response.data[i].strongSell)
      result['xcateg'].push(response.data[i].period.slice(0,7))
      result['buy'].push(response.data[i].buy)
      result['hold'].push(response.data[i].hold)
      result['sell'].push(response.data[i].sell)
    }
    return result;
}

app.get('/company-recommendation-trends', (req, res) => {

    params = req.query;
    url = 'https://finnhub.io/api/v1/stock/recommendation';
    axios.get(url, {
        params: {...params, 'token':finhub_key}
    })
    .then(function (response) {
        // res.json(response.data);

        if(!response || !response.data || !response.data.length){
            res.json({});
            return;
        }
        x = getRecommendationData(response);
        res.send(x);
    })
    .catch(function (error){
        res.json({})
    });

});

app.get('/company-social-sentiment', (req, res) => {

    params = req.query;
    url = 'https://finnhub.io/api/v1/stock/social-sentiment';
    axios.get(url, {
        params: {...params, 'token':finhub_key}
    })
    .then(function (response) {
        res.json(response.data);
    })
    .catch(function (error){
        res.json({})
    });

});

app.get('/company-peers', (req, res) => {

    params = req.query;
    url = 'https://finnhub.io/api/v1/stock/peers';
    axios.get(url, {
        params: {...params, 'token':finhub_key}
    })
    .then(function (response) {
        res.json(response.data);
    })
    .catch(function (error){
        res.json({})
    });

});

function getCompanyEarningsData(response){
    let result = {
        'actual': [],
        'estimate': [],
        'xcateg': []
    }

    for(let i=0; i<response.data.length; i++){
        if (response.data[i].actual == null){
            result['actual'].push([i, 0])
        }
        else{
            result['actual'].push([i, response.data[i].actual])
        }
        if (response.data[i].surprise == null){
            result['xcateg'].push(response.data[i].period + '<br>' + 'Surprise:' + ' 0')
        }
        else{
            result['xcateg'].push(response.data[i].period + '<br>' + 'Surprise: ' + response.data[i].surprise.toString())
        }
        if (response.data[i].estimate == null){
            result['estimate'].push([i, 0])
        }
        else{
            result['estimate'].push([i, response.data[i].estimate])
        }
    }
    console.log(result);
    return result;
}

app.get('/company-earnings', (req, res) => {

    params = req.query;
    url = 'https://finnhub.io/api/v1/stock/earnings';
    axios.get(url, {
        params: {...params, 'token':finhub_key}
    })
    .then(function (response) {s
        if(!response || !response.data || !response.data.length){
            res.json({});
            return;
        }

        x = getCompanyEarningsData(response);
        res.send(x);
    })
    .catch(function (error){
        res.json({})
    });

});

async function getCompanyEarnings(symbol){

    url = 'https://finnhub.io/api/v1/stock/earnings';
    return axios.get(url, {
        params: {
            'symbol': symbol,
            'token': finhub_key,
        }
    });

};

app.get('*', (req, res) => {
    res.send('I don\'t know that path');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});