const express = require("express");
const ClassifierController = require("../controllers/classifierController");
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });

class ClassifierRoutes {
    constructor() {
        this._route = express.Router();
        this.classifierController = new ClassifierController();
        this.registerRoutes();
    }

    get route() {
        return this._route;
    }

    registerRoutes() {
        this.route.post('/classify', upload.single('image'), this.classifierController.classifyImage);
    }
}

module.exports = ClassifierRoutes;
