"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./src/config/config"); //les accolades {} sont utilisées pour spécifier les éléments particuliers
const Logging_1 = __importDefault(require("./src/library/Logging"));
// Création d'une instance d'Express
const router = (0, express_1.default)();
/** Connexion à la base de données MongoDB */
mongoose_1.default
    .connect(config_1.config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
    Logging_1.default.info('Mongo connected successfully.');
    StartServer();
})
    .catch((error) => Logging_1.default.error(error));
/** Démarrage du serveur Express uniquement si la connexion à MongoDB réussi */
const StartServer = () => {
    /** Middleware pour journaliser les requêtes entrantes et les réponses sortantes */
    router.use((req, res, next) => {
        /** Journalisation de la requête entrante */
        Logging_1.default.info(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
        res.on('finish', () => {
            /** Journalisation de la réponse sortante après l'envoi au client */
            Logging_1.default.info(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
        });
        next();
    });
    // Configuration d'Express pour gérer les données POST et JSON
    router.use(express_1.default.urlencoded({ extended: true })); // Middleware pour gérer les données POST
    router.use(express_1.default.json()); // Middleware pour gérer les données JSON
    // Middleware pour gérer les règles de l'API, les en-têtes CORS, etc.
    router.use((req, res, next) => {
        // Configuration des en-têtes CORS pour permettre l'accès depuis n'importe quelle origine ('*')
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method == 'OPTIONS') {
            // Configuration des méthodes HTTP autorisées lors de la pré-vérification CORS (OPTIONS)
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }
        next(); // Passer la main au middleware suivant
    });
    // Définition des routes de l'API
    //… a compléter plus tard
    // Healthcheck - une route simple pour vérifier que le serveur fonctionne
    router.get('/ping', (req, res, next) => res.status(200).json({ hello: 'world' }));
    // Middleware de gestion des erreurs pour les routes non trouvées
    router.use((req, res, next) => {
        const error = new Error('Not found');
        Logging_1.default.error(error);
        res.status(404).json({
            message: error.message
        });
    });
};
