const tf = require("@tensorflow/tfjs-node");
const clases = require('../clases.json');

const diccionario = clases.caracteristicas;
const IMG_WIDTH = 100;
const IMG_HEIGHT = 100;
const SCALA = 255;
const RGB = 3;

class L2 {
    static className = 'L2';
    constructor(config) {
       return tf.regularizers.l1l2(config)
    }
}

class ImageClassifier {
    constructor(modelPath) {
        tf.serialization.registerClass(L2);
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
                const startTime = performance.now();
                const classPredicted = tf.argMax(predictions, 1).arraySync()[0];
                const predictedClass = diccionario[classPredicted];
                 // Normalizar los valores de predicción
                const normalizedPredictions = tf.div(predictions, tf.sum(predictions)).arraySync();
                // Obtener el porcentaje de confianza de la clase predicha
                const nivel_confianza = Math.round(normalizedPredictions[0][classPredicted] * 100);
                // Devolver la clase predicha y el porcentaje de confianza
                const endTime = performance.now();
                const inferenceTime = endTime - startTime;
                return { 
                    clase: predictedClass, 
                    confianza: nivel_confianza, 
                    tiempoInferencia: inferenceTime
                };
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
