const express = require('express')
const router = express.Router()

const blogsData = require('../data/blogs.json')

router.get('/', (req, res) => {
    res.json(blogsData)
})

module.exports = router