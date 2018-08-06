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
            getCoinHist(coin[1].Symbol)            
        }, i*1000);
     })     
})

const getCoinHist = (coinSymbol) => {
    
    const url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + coinSymbol + "&tsym=BTC&allData=true";
    axios.get(url)
    .then(response => {
        let data = response.data.Data
        
        if  ( isRlz(data) && isPriceDown(data) && isVolumeUp(data) ) {
            console.log("adding " + coinSymbol + " to table")             
        } else {
            console.log("removing " + coinSymbol + " from table")
        }
        
    })
    .catch(err => console.log(err))
}

const isRlz = (priceHistory) => {

    let highPrice = 0;
    let currentPrice = priceHistory[0].close

    priceHistory.forEach(day => {
        highPrice = day.close > highPrice ? day.close : highPrice
    })

    return currentPrice < highPrice * .786 ? true : false  

}

const isPriceDown = (priceHistory) => {
    let sumNine = 0
    let sumThirty = 0

    // create nine and thirty day totals
    for (let i = 0; i < 29; i++) {
        if (i < 9) {
            sumNine += priceHistory[i].close  
        }
        sumThirty += priceHistory[i].close
    }

    //return true if thirty day average is greater than nine day average
    return (sumThirty / 30) > (sumNine / 9) ? true : false
}

const isVolumeUp = (priceHistory) => {
    return true
    // return true if volume 9MA > 30MA
}