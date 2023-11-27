require("dotenv/config");
const bodyParser = require("body-parser");
const express = require("express");
const ClassifierRoutes = require("./src/routes/classifierRoutes");
const app = express();
const PORT = 3001 || process.env.PORT;
const cors = require('cors');
const allowedOrigins = ['http://localhost:3000'];
const options = {
    origin: allowedOrigins,
};
app.use(cors(options));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routes = (server) => {
    server.use('/api', new ClassifierRoutes().route);
};
routes(app);

app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
