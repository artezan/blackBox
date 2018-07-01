"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("./router/user");
const bodyParser = require("body-parser");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const logger = require("morgan");
const general_1 = require("./router/general");
const DialogFlow_1 = require("./router/DialogFlow");
const Files_1 = require("./router/Files");
class Server {
    constructor() {
        this.userRouter = new user_1.UserRouter();
        this.generalRouter = new general_1.GeneralRouter();
        this.dialogRouter = new DialogFlow_1.DialogFlow();
        this.filesRouter = new Files_1.FileUpload();
        this.app = express();
        this.config();
        this.routes();
    }
    // application config
    config() {
        const MONGO_URI = "mongodb://cesar:180292@ds117469.mlab.com:17469/cesar";
        mongoose.connect(MONGO_URI || process.env.MONGODB_URI);
        // express middleware
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
        this.app.use(logger("dev"));
        this.app.use(compression());
        this.app.use(helmet());
        this.app.use(cors());
        // cors
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "http://localhost:8100");
            res.header("Access-Control-Allow-Origin", "http://localhost:4200");
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            // tslint:disable-next-line:max-line-length
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
            res.header("Access-Control-Allow-Credentials", "true");
            next();
        });
    }
    // application routes
    routes() {
        const router = express.Router();
        this.app.use("/", router);
        this.app.use("/api/v1/users", this.userRouter.router);
        this.app.use("/api/v1/dialog", this.dialogRouter.router);
        this.app.use("/api/v1/general", this.generalRouter.router);
        this.app.use("/api/v1/files", this.filesRouter.router);
    }
}
// export
exports.default = new Server().app;
//# sourceMappingURL=server.js.map