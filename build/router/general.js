"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const User_1 = require("../models/User");
const brain = require("brain.js");
class GeneralRouter {
    constructor() {
        this.router = express_1.Router();
        this.routes();
    }
    uploadMongo(req, res) {
        // usuario
        const emailUser = req.headers.email;
        // nombre de tabla
        const tableName = req.params.tableName;
        // obtiene todos para generar la db
        const arrDocuments = req.body;
        // obtiene fecha actual
        const date = new Date(Date.now());
        // genera collection
        mongoose_1.connection.db.createCollection(tableName, (error, collection) => {
            if (error) {
                res.status(500).json({ error });
            }
            // inserta docs
            collection
                .insert(arrDocuments)
                .then(data => {
                // actualiza tables en user
                User_1.default.findOne({ email: emailUser })
                    .then(user => {
                    user.tables.push({ name: tableName, date: date });
                    user.save().then(() => {
                        res.status(200).json({ data: data.ops });
                    });
                })
                    .catch(error => {
                    res.status(500).json({ error });
                });
            })
                .catch(error => {
                res.status(500).json({ error });
            });
        });
        // guarda el json en la db
        // general.collection
        //   .insert(arrDocuments)
        //   .then(data => {
        //     User.findOne({ email: emailUser })
        //       .then(user => {
        //         user.tables.push(tableName);
        //         user.save().then(() => {
        //           res.status(200).json({ data });
        //         });
        //       })
        //       .catch(error => {
        //         res.status(500).json({ error });
        //       });
        //     // res.status(200).json({ data });
        //   })
        //   .catch(error => {
        //     res.status(500).json({ error });
        //   });
    }
    all(req, res) {
        mongoose_1.connection.db
            .collection(req.params.tableName)
            .find({})
            .toArray((err, result) => {
            res.status(200).json({ result });
        });
    }
    sumaryItem(req, res) {
        mongoose_1.connection.db
            .collection(req.params.tableName)
            .find({})
            .toArray((err, result) => {
            const arrSize = result.length;
            const objSize = Object.keys(result[0]).length;
            let numString = 0;
            let numNumber = 0;
            Object.keys(result[0]).forEach(key => {
                if (!isNaN(result[0][key])) {
                    numNumber++;
                }
                else {
                    numString++;
                }
            });
            const data = {
                arrSize: arrSize,
                objSize: objSize,
                numString: numString,
                numNumber: numNumber
            };
            res.status(200).json({ data });
        });
    }
    delete(req, res) {
        // usuario
        const emailUser = req.headers.email;
        const tableName = req.params.tableName;
        mongoose_1.connection.db.collection(tableName).drop((error, delOK) => {
            if (error) {
                res.status(500).json({ error });
            }
            if (delOK) {
                User_1.default.findOne({ email: emailUser }).then((data) => {
                    data.tables.forEach((item, i) => {
                        if (item.name === tableName) {
                            data.tables.splice(i, 1);
                        }
                    });
                    data.save().then(() => {
                        res
                            .status(200)
                            .json({ data: "borrado" })
                            .end();
                    });
                });
            }
        });
    }
    // public getRegression(req: Request, res: Response): void {
    //   const numX = req.params.numX;
    //   const data: Array<{ x: number[]; y: number[] }> = req.body;
    //   const regression = new smr.Regression({ numX: numX, numY: 1 });
    //   data.forEach(item => {
    //     regression.push(item);
    //   });
    //   // regression.push({ x: , y: [250] });
    //   // regression.push({ x: [40, 50], y: [500] });
    //   // regression.push({ x: [50, 80], y: [600] });
    //   const coefficients = regression.calculateCoefficients();
    //   res.status(200).json({ calculateCoefficients: coefficients });
    //   console.log(regression.hypothesize({ x: [1, 2] }));
    // }
    brainTS(req, res) {
        // Recibe data
        const tableName = req.body.tableName;
        const keysInput = req.body.input;
        const question = req.body.question;
        const keyOutput = req.body.output;
        const isString = req.body.isString;
        const arrInput = [];
        const arrOutput = [];
        mongoose_1.connection.db
            .collection(tableName)
            .find({})
            .toArray((err, result) => {
            // construir labels de outputs
            const arrTempLabels = [];
            result.forEach(item => {
                if (item[keyOutput]) {
                    const pos = arrTempLabels.indexOf(item[keyOutput]);
                    if (pos === -1) {
                        arrTempLabels.push(item[keyOutput]);
                    }
                }
            });
            // construir arreglo output numerico y input
            result.forEach(item => {
                const arrTempInput = [];
                let arrTempOutput = [];
                // inputs
                keysInput.forEach(key => {
                    if (item[key] && !isString) {
                        arrTempInput.push(item[key]);
                    }
                    else if (item[key] && isString) {
                        arrTempInput.push(item[key].toString());
                    }
                });
                // outputs
                if (isString) {
                    arrTempOutput = item[keyOutput];
                }
                else {
                    arrTempLabels.forEach((label, i) => {
                        if (item[keyOutput] === label) {
                            arrTempOutput[i] = 1;
                        }
                        else {
                            arrTempOutput[i] = 0;
                        }
                    });
                }
                arrInput.push(arrTempInput);
                arrOutput.push(arrTempOutput);
            });
            //  ordena y junta datos
            const orderedData = arrInput.map((sample, index) => {
                return {
                    input: sample,
                    output: arrOutput[index]
                };
            });
            // START recorre el arreglo
            let currentIndex = orderedData.length;
            let temporaryValue;
            let randomIndex;
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                // And swap it with the current element.
                temporaryValue = orderedData[currentIndex];
                orderedData[currentIndex] = orderedData[randomIndex];
                orderedData[randomIndex] = temporaryValue;
            }
            // END mezclar datos
            // START prediction
            if (!isNaN(question[0])) {
                const net = new brain.NeuralNetwork();
                net.train(orderedData);
                const prediction = net.run(question);
                res.status(200).json({ data: prediction });
            }
            else {
                const net = new brain.recurrent.LSTM();
                net.train(orderedData, { iterations: 500 });
                const prediction = net.run(question);
                console.log(prediction);
                res.status(200).json({ data: prediction });
            }
        });
        // END prediction
    }
    brain2() {
        console.log("algo");
        const net = new brain.recurrent.LSTM();
        net.train([
            { input: ["a", "b", "1"], output: "happy" },
            { input: ["z", "y", "2"], output: "sad" }
        ], { iterations: 1000 });
        const output = net.run(["z", "y", "2"]); // 'happy'
        console.log(output);
    }
    getTableById(req, res) {
        const tableName = req.body.tableName;
        const itemId = req.body.itemId;
        console.log(itemId);
        mongoose_1.connection.db
            .collection(tableName)
            .find({ _id: mongoose_1.Types.ObjectId(itemId) })
            .toArray((err, result) => {
            res.status(200).json({ result });
        });
    }
    routes() {
        this.router.post("/:tableName", this.uploadMongo);
        this.router.get("/:tableName", this.all);
        this.router.post("/id/item", this.getTableById);
        this.router.get("/sumary/:tableName", this.sumaryItem);
        this.router.post("/brain/brain", this.brainTS);
        this.router.get("/brain/brain2", this.brain2);
        this.router.delete("/:tableName", this.delete);
    }
}
exports.GeneralRouter = GeneralRouter;
//# sourceMappingURL=general.js.map