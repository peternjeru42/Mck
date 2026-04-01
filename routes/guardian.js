const { Router } = require('express')
const {
    create,
    get,
    getOne,
    deleteGuardian,
    edit
} = require('../controllers/guardian')

//create an instance of a router
const router = new Router()

router.post('/:studentId', create)
router.get('/', get)
router.get('/:id', getOne)
router.put('/:id', edit)
router.delete('/:id', deleteGuardian)

module.exports = router