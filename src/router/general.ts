import { Request, Response, Router } from "express";
import { model, Schema, Document, connection } from "mongoose";
import User, { IUser } from "../models/User";
import * as smr from "smr";

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
    // nombre de tabla
    const tableName = req.params.tableName;
    // obtiene todos para generar la db
    const arrDocuments: Array<any> = req.body;
    // obtiene fecha actual
    const date = new Date(Date.now());

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
  public routes() {
    this.router.post("/:tableName", this.uploadMongo);
    // this.router.post("/regression/:numX", this.getRegression);
    this.router.get("/:tableName", this.all);
    this.router.get("/sumary/:tableName", this.sumaryItem);
    this.router.delete("/:tableName", this.delete);
  }
}
