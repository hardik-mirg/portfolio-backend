const express = require('express')
const router = express.Router()

const blogs = require('./blogs')
const library = require('./library')
const music = require('./music')
const photography = require('./photography')
const projects = require('./projects')
const images = require('./images')

router.use('/blogs', blogs)
router.use('/library', library)
router.use('/music', music)
router.use('/photography', photography)
router.use('/projects', projects)
router.use('/images', images)

module.exports = router