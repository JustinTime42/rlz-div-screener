const axios = require('axios')
const knex = require('knex')
const pg = require('pg')

// Create connection for Postgres Database.
const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    }
})

// Get list of coins from cryptocompare.
// For each coin, call getCoinHist with delay to avoid exceeding rate limit.
axios.get("https://min-api.cryptocompare.com/data/all/coinlist")
.then(response => {    
    Object.entries(response.data.Data).forEach((coin, i) => {
        setTimeout(() => {
            getCoinHist(coin[1].Symbol)            
        }, i*1000)
     })     
})

const getCoinHist = (coinSymbol) => {

    // Get all price data for the coin.
    const url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + coinSymbol + "&tsym=BTC&allData=true"
    axios.get(url)
    .then(response => {

        // Add coin to table if price is in RLZ, price is trending down, and volume is trending up.
        let data = response.data.Data        
        if  ( isRlz(data) && isPriceDown(data) && isVolumeUp(data) ) {                 
            db('screenedcoins')
            .returning('coin')
            .insert({coin: coinSymbol})   
            .catch(error => console.log(error.detail))
            .then(coin => console.log(coin + " added to table"))    
        // Otherwise, remove the coin from the table.
        } else {
            console.log("removing " + coinSymbol + " from table")
            db('screenedcoins')
            .where('coin', coinSymbol)
            .del()
            .then(console.log)
            .catch(error => console.log(error))
        }        
    })
    .catch(err => console.log(err))
}

const isRlz = (priceHistory) => {
    let highPrice = 0    
    let currentPrice = priceHistory[0].close
    let lowPrice = currentPrice

    // Iterate through each day, adjusting highPrice or lowPrice if currentPrice is outside that range.
    priceHistory.forEach(day => {
        highPrice = day.close > highPrice ? day.close : highPrice
        lowPrice = day.close < lowPrice ? day.close : lowPrice
    })

    // Calculate the rlz (78.6% of range) and return true if current price is less than rlz.
    let rlz = highPrice - ((highPrice - lowPrice) * .786)
    return currentPrice < rlz ? true : false  
}

const isPriceDown = (priceHistory) => {
    let sumNine = 0
    let sumEighteen = 0

    // Create nine and eighteen day totals.
    for (let i = 0; i < 18; i++) {
        if (i < 6) {
            sumNine += priceHistory[i].close  
        }
        sumEighteen += priceHistory[i].close
    }

    // Return true if eighteen day average is greater than nine day average.
    return (sumEighteen / 18) > (sumNine / 6) ? true : false
}

const isVolumeUp = (priceHistory) => {
    let sumNine = 0
    let sumEighteen = 0

    // Create nine and eighteen day totals.
    for (let i = 0; i < 18; i++) {
        if (i < 6) {
            sumNine += priceHistory[i].volumeto  
        }
        sumEighteen += priceHistory[i].volumeto
    }

    // Return true if eighteen day average is less than nine day average.
    return (sumEighteen / 18) < (sumNine / 6) ? true : false
}