const express = require('express')
const knex = require('knex')
const cors = require('cors')

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    }    
})

const app = express();

app.use(cors())

app.get('/', (req, res) => { 
   
    db.select('*').from('ScreenedCoins')
    .then(data => {
        res.json(data)
    })       
})

app.listen(process.env.PORT);