const router = require('express').Router();

// Rutas
router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;