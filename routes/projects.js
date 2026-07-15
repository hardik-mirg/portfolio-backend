const express = require('express')
const router = express.Router()

const projectsData = require('../data/projects.json')
const githubService = require('../services/githubService')

router.get('/', async (req, res) => {
    try {
        const { stats, commits } = await githubService.getStatsAndCommits();
        res.json({
            projects: projectsData.projects || [],
            stats,
            commits
        });
    } catch (error) {
        // Fallback to static data from projects.json if service totally fails
        res.json({
            projects: projectsData.projects || [],
            stats: projectsData.stats || { commits: '340+', repositories: '18', stars: '95', views: '1,250' },
            commits: projectsData.commits || []
        });
    }
})

module.exports = router