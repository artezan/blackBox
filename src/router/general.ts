import { Request, Response, Router } from "express";
import {
  model,
  Schema,
  Document,
  connection,
  Types,
  Collection
} from "mongoose";
import User, { IUser } from "../models/User";
import * as smr from "smr";
import * as brain from "brain.js";
import { io } from "..";

export class GeneralRouter {
  public router: Router;
  general;

  constructor() {
    this.router = Router();
    this.routes();
  }
  public uploadMongo(req: Request, res: Response): void {
    // usuario
    const emailUser = req.headers.email;
    // tipo
    const type: string = <string>req.headers.type;
    // nombre de tabla
    const tableName = req.params.tableName;
    // obtiene todos para generar la db
    const arrDocuments: Array<any> = req.body;
    // obtiene fecha actual
    const date = new Date(Date.now());

    // veridfica que no exista

    connection.db.collection(tableName).drop();

    // genera collection

    connection.db.createCollection(tableName, (error, collection) => {
      if (error) {
        res.status(500).json({ error });
      }
      // inserta docs
      collection
        .insert(arrDocuments)
        .then(data => {
          // actualiza tables en user
          User.findOne({ email: emailUser })
            .then(user => {
              const hasTableIndex = user.tables.findIndex(
                table => table.name === tableName
              );
              if (hasTableIndex !== -1) {
                user.tables[hasTableIndex] = {
                  name: tableName,
                  date: date,
                  type: type
                };
              } else {
                user.tables.push({
                  name: tableName,
                  date: date,
                  type: type
                });
              }
              user.save().then(() => {
                // emite upload/avisa que se actualiza
                io.emit("GET_USER", "getTable");
                io.emit("GET_TABLE", tableName);
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
  }
  public all(req: Request, res: Response): void {
    connection.db
      .collection(req.params.tableName)
      .find({})
      .toArray((err, result) => {
        res.status(200).json({ result });
      });
  }
  public sumaryItem(req: Request, res: Response): void {
    connection.db
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
          } else {
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
  public delete(req: Request, res: Response): void {
    // usuario
    const emailUser = req.headers.email;
    const tableName: string = req.params.tableName;
    connection.db.collection(tableName).drop((error, delOK) => {
      if (error) {
        res.status(500).json({ error });
      }
      if (delOK) {
        User.findOne({ email: emailUser }).then((data: IUser) => {
          data.tables.forEach((item, i) => {
            if (item.name === tableName) {
              data.tables.splice(i, 1);
            }
          });
          data.save().then(() => {
            // emit delete
            io.emit("GET_USER", "getTable");
            io.emit("GET_TABLE", tableName);
            // resp
            res
              .status(200)
              .json({ data: "borrado" })
              .end();
          });
        });
      }
    });
  }
  brainTS(req: Request, res: Response): void {
    // Recibe data
    const tableName: string = req.body.tableName;
    const keysInput: any[] = req.body.input;
    const question: any[] = req.body.question;
    const keyOutput = req.body.output;
    const isString: boolean = req.body.isString;
    const arrInput = [];
    const arrOutput = [];
    connection.db
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
            } else if (item[key] && isString) {
              arrTempInput.push(item[key].toString());
            }
          });
          // outputs
          if (isString) {
            arrTempOutput = item[keyOutput];
          } else {
            arrTempLabels.forEach((label, i) => {
              if (item[keyOutput] === label) {
                arrTempOutput[i] = 1;
              } else {
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
          const prediction: any[] = net.run(question);
          let result = "";
          prediction.forEach((pos, i) => {
            if (Math.round(pos) === 1) {
              result = arrTempLabels[i];
            }
          });
          res.status(200).json({ data: result });
        } else {
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

    net.train(
      [
        { input: ["a", "b", "1"], output: "happy" },
        { input: ["z", "y", "2"], output: "sad" }
      ],
      { iterations: 1000 }
    );

    const output = net.run(["z", "y", "2"]); // 'happy'
    console.log(output);
  }
  getTableById(req: Request, res: Response): void {
    const tableName = req.body.tableName;
    const itemId = req.body.itemId;
    console.log(itemId);
    connection.db
      .collection(tableName)
      .find({ _id: Types.ObjectId(itemId) })
      .toArray((err, result) => {
        res.status(200).json({ result });
      });
  }
  public routes() {
    this.router.post("/:tableName", this.uploadMongo);
    this.router.get("/:tableName", this.all);
    this.router.post("/id/item", this.getTableById);
    this.router.get("/sumary/:tableName", this.sumaryItem);
    this.router.post("/brain/brain", this.brainTS);
    this.router.get("/brain/brain2", this.brain2);
    this.router.delete("/:tableName", this.delete);
  }
}
