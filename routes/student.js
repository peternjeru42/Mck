const { Router } = require('express')
const {
    create,
    get,
    getOne,
    deleteStudent,
    edit
} = require('../controllers/student')

//create an instance of a router
const router = new Router()

router.post('/', create)
router.get('/', get)
router.get('/:id', getOne)
router.put('/:id', edit)
router.delete('/:id', deleteStudent)

module.exports = router