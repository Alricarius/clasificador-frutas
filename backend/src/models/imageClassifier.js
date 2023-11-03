const tf = require("@tensorflow/tfjs-node");
const clases = require('../clases.json');

const diccionario = clases.caracteristicas;
const IMG_WIDTH = 224;
const IMG_HEIGHT = 224;
const SCALA = 255;
const RGB = 3;

class ImageClassifier {
    constructor(modelPath) {
        this.loadModel(modelPath);
    }

    async loadModel(modelPath) {
        try {
            console.log('Cargando modelo....');
            this.model = await tf.loadLayersModel(`file://${modelPath}`);
            console.log('Modelo cargado exitosamente.');
        } catch (error) {
            console.error('Error al cargar el modelo desde', modelPath, ':', error);
        }
    }

    async classifyImage(imageBuffer) {
        if (!this.model) {
            console.error('El modelo no se ha cargado correctamente.');
            return [];
        }
        try {
            const batchedInput = this.decodeImageToPredict(imageBuffer);
            const predictions = await this.model.predict(batchedInput);
    
            if (!predictions) {
                console.error('Las predicciones no son un tensor válido:', predictions);
            } else {
                const classPredicted = tf.argMax(predictions, 1).arraySync()[0];
                const predictedClass = diccionario[classPredicted];
    
                return predictedClass;
            }
        } catch (error) {
            console.error('Error al clasificar la imagen:', error);
        }
        return [];
    }

    decodeImageToPredict(imageBuffer){
        const decodedImage = tf.node.decodeImage(imageBuffer);
        const preprocessedImage = decodedImage
            .resizeBilinear([IMG_WIDTH, IMG_HEIGHT])
            .toFloat();
        const inputTensor = preprocessedImage.div(tf.scalar(SCALA));
        const batchedInput = inputTensor.reshape([1, IMG_WIDTH, IMG_HEIGHT, RGB]);
        return batchedInput;
    }
}

module.exports = new ImageClassifier('src/utils/cnnmodel/model.json');
