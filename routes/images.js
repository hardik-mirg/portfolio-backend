const express = require('express')
const path = require('path')
const router = express.Router()

router.get('/:id', (req, res) => {
    const { id } = req.params

    res.sendFile(path.join(__dirname, `../data/images/${id}.jpg`), (err) => {
        if (err) {
            res.status(404).json({ error: 'Image not found' })
        }
    })

})

module.exports = router