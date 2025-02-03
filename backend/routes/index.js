const express = require('express');
const router = express.Router();

const lessonRoutes = require('./lessonRoutes');
const educationRoutes = require('./educationRoutes');
const authRoutes = require('./authRoutes');

const openaiRoute = require('./openai');

router.use('/lessons', lessonRoutes);
router.use('/educations', educationRoutes);
router.use('/auth', authRoutes);
router.use('/openai', openaiRoute);

// Debug için tüm route'ları yazdır
router.stack.forEach(function(r){
    if (r.route && r.route.path){
        console.log('Route:', r.route.path)
    }
});

module.exports = router;