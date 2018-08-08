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
        }, i*1000)
     })     
})

const getCoinHist = (coinSymbol) => {    
    const url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + coinSymbol + "&tsym=BTC&allData=true"
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
    let highPrice = 0    
    let currentPrice = priceHistory[0].close
    let lowPrice = currentPrice

    priceHistory.forEach(day => {
        highPrice = day.close > highPrice ? day.close : highPrice
        lowPrice = day.close < lowPrice ? day.close : lowPrice
    })
    let rlz = highPrice - ((highPrice - lowPrice) * .786)
    return currentPrice < rlz ? true : false  
}

const isPriceDown = (priceHistory) => {
    let sumNine = 0
    let sumThirty = 0

    // create nine and thirty day totals
    for (let i = 0; i < 18; i++) {
        if (i < 6) {
            sumNine += priceHistory[i].close  
        }
        sumThirty += priceHistory[i].close
    }

    //return true if thirty day average is greater than nine day average
    return (sumThirty / 18) > (sumNine / 6) ? true : false
}

const isVolumeUp = (priceHistory) => {
    let sumNine = 0
    let sumThirty = 0

    // create nine and thirty day totals
    for (let i = 0; i < 18; i++) {
        if (i < 6) {
            sumNine += priceHistory[i].volumeto  
        }
        sumThirty += priceHistory[i].volumeto
    }

    //return true if thirty day average is less than nine day average
    return (sumThirty / 18) < (sumNine / 6) ? true : false
}