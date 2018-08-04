const axios = require('axios')
const knex = require('knex')
const pg = require('pg')

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    }
})

axios.get("https://min-api.cryptocompare.com/data/all/coinlist")
.then(response => { 
    Object.entries(response.data.Data).forEach((coin, i) => {
        setTimeout(() => {
            getCoinsHist(coin[1].Symbol)            
        }, i*1000);
     })     
})

const getCoinHist = (coinSymbol) => {
    const url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + coinSymbol + "&tsym=BTC";
    axios.get(url)
    .then(response => {
        let data = response.Data.Data
        /*
        if  (
            Call function to find highest price and return true if current price < 78.6% of highest
            Call function to return true if price 30MA > 9MA
            call function to return true if volume 9MA > 30MA
            ) {
                add coin to table                
            }
        */
    })
    .catch(err => console.log(err))
}