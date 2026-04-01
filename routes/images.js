const multer = require('multer')
const { create, getOne, get, deleteImg, edit } = require('../controllers/images')
const { Router } = require('express')

const router = new Router()

// Set up multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('image'), create)
router.get('/:imageId', getOne)
router.get('/', get)
router.put('/:imageId', edit)
router.delete('/:imageId', deleteImg)

module.exports = router

