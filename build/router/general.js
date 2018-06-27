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
        const net = new brain.NeuralNetwork();
        // net.train([
        //   { input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 } },
        //   { input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 } },
        //   { input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 } }
        // ]);
        // const dataUser: any = { r: 1, g: 0.4, b: 0 };
        // const output = net.run(dataUser); // { white: 0.99, black: 0.002 }
        // console.log(output);
        mongoose_1.connection.db
            .collection("Llamadas-vendidos")
            .find({})
            .toArray((err, result) => {
            const arr = [];
            result.forEach(item => {
                arr.push({
                    input: { x: item['"No Llamadas"'] },
                    output: { y: item['"No. equipos vendidos"'] }
                });
            });
            net
                .trainAsync(arr)
                .then(res => {
                // do something with my trained network
                const dataUser = { x: 20 };
                const output = net.run(dataUser);
                console.log(output);
            })
                .catch();
            // net.train(arr);
            // const dataUser: any = { x: 100 };
            // const output = net.run(dataUser); // { white: 0.99, black: 0.002 }
            // console.log(arr);
            // console.log(output);
            res.status(200).json({ result });
        });
    }
    routes() {
        this.router.post("/:tableName", this.uploadMongo);
        // this.router.post("/regression/:numX", this.getRegression);
        this.router.get("/:tableName", this.all);
        this.router.get("/sumary/:tableName", this.sumaryItem);
        this.router.get("/brain/brain", this.brainTS);
        this.router.delete("/:tableName", this.delete);
    }
}
exports.GeneralRouter = GeneralRouter;
//# sourceMappingURL=general.js.map