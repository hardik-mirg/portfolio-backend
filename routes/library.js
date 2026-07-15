const express = require('express')
const router = express.Router()

const libraryData = require('../data/library.json')

router.get('/', (req, res) => {
    res.json(libraryData)
})

module.exports = router