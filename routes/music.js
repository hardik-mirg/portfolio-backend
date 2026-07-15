const express = require('express')
const router = express.Router()

const musicData = require('../data/music.json')

router.get('/', (req, res) => {
    res.json(musicData)
})

module.exports = router