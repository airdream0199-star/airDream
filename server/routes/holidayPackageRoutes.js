const express = require('express');
const router = express.Router();
const store = require('../utils/dataStore');

router.get('/', (req, res) => res.json(store.get('holidayPackages')));
router.post('/', (req, res) => res.status(201).json(store.add('holidayPackages', req.body)));
router.put('/:id', (req, res) => res.json(store.update('holidayPackages', req.params.id, req.body)));
router.delete('/:id', (req, res) => {
  store.delete('holidayPackages', req.params.id);
  res.json({ message: 'Holiday package deleted' });
});

module.exports = router;

