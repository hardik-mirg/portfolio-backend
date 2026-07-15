const express = require('express')
const path = require('path')
const fs = require('fs/promises');
const router = express.Router()

router.get('/:id', async (req, res) => {
    const { id } = req.params

    const filePath = path.join(__dirname, `../data/images/${id}.jpeg`)

    try {
        await fs.access(filePath)
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        res.sendFile(filePath)
    } catch (err) {
        res.status(404).json({ error: 'Image not found' })
    }
})

module.exports = router
