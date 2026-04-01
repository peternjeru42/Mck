const { Router } = require('express')
const {
    create,
    get,
    getOne,
    deletePerson,
    edit
} = require('../controllers/emergency-contact')

//create an instance of a router
const router = new Router()

router.post('/:studentId', create)
router.get('/', get)
router.get('/:id', getOne)
router.put('/:id', edit)
router.delete('/:id', deletePerson)

module.exports = router