const Image = require('../models/images')

async function create(req, res) {
    try {
        const newImage = new Image({
            data: req.file.buffer,
            contentType: req.file.mimetype,
        });

        await newImage.save();
        res.status(201).json({ message: 'Image uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error uploading image' });
    }
}

async function getOne(req, res) {
    try {
        const image = await Image.findById(req.params.imageId);

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.set('Content-Type', image.contentType);
        res.send(image.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving image' });
    }
}

async function get(req, res) {
    try {
        const images = await Image.find();

        if (!images || images.length === 0) {
            return res.status(404).json({ message: 'No images found' });
        }

        // Extract image IDs and return them in the response
        const imageIds = images.map((image) => image._id);
        res.json({ imageIds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving images' });
    }
}

async function deleteImg(req, res) {
    try {
        const deletedImage = await Image.findByIdAndDelete(req.params.imageId);

        if (!deletedImage) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting image' });
    }
}

async function edit(req, res) {
    try {
        const updatedImage = await Image.findByIdAndUpdate(
            req.params.imageId,
            { $set: req.body }, // Assuming req.body contains the updated data
            { new: true }
        );

        if (!updatedImage) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.json({ message: 'Image updated successfully', updatedImage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating image' });
    }
}

module.exports = { create, getOne, get, deleteImg, edit }