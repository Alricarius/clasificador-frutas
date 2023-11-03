const fs = require("fs");
const path = require("path");
const imageClassifier = require("../models/imageClassifier.js");

class ClassifierController {
    constructor() {
        this.classifyImage = async (req, res) => {
            if (!req.file) {
                return res.status(400).json({ error: 'No se proporcionó una imagen.' });
            }
            const imagePath = req.file.path;
            const finalPath = path.join(__dirname, '../../', 'uploads', path.basename(imagePath));
            const imageBuffer = fs.readFileSync(finalPath);
            const predictions = await imageClassifier.classifyImage(imageBuffer);
            res.json({ prediction: predictions });
        };
    }
}

module.exports = ClassifierController;
