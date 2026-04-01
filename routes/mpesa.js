const { validation, confirmation} = require('../controllers/mpesa')
const { Router } = require('express')
 
const router = new Router()

router.post('/validation', validation);
router.post('/confirmation', confirmation);


// // optional admin/testing routes
// router.get('/payments', async (req, res) => {
//   const Payment = require('./models/Payment');
//   const p = await Payment.find().sort({ created_at: -1 }).limit(200);
//   res.json(p);
// });

module.exports = router