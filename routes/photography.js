const express = require('express')
const router = express.Router()

const photographyData = require('../data/photography.json')

router.get('/', (req, res) => {
    res.json(photographyData)
})

module.exports = router