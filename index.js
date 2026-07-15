require('dotenv').config()
const cors = require('cors')
const express = require('express')
const app = express()
const PORT = process.env.PORT

const api = require('./routes/api')

app.use(cors("*"))

app.use(express.json())

app.use('/api', api)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
