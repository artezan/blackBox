import { Request, Response, Router } from "express";
// Google Assistant deps
import {
  dialogflow,
  SimpleResponse,
  BasicCard,
  Button,
  Image,
  List,
  Suggestions,
  OptionItem
} from "actions-on-google";
import {
  OptionItems,
  Table,
  TableOptions
} from "actions-on-google/dist/service/actionssdk";
import User from "../models/User";
import { connection, Types } from "mongoose";
import { ObjectId } from "bson";

export class DialogFlow {
  public router: Router;
  public tableName: string;

  constructor() {
    this.router = Router();
    this.routes();
  }
  public routes() {
    // Inicia google app
    const app = dialogflow();
    // intentos de preguntas
    /**
     * nombre de intent
     * respuesta de la pregunta
     * La funcion es asincrona para esperar a que responda el helper
     */
    app.intent("list-general-tables", async conv => {
      this.tableName = undefined;
      // espera al helper que da la info de las tablas
      const arrTables = await this.getGeneralTables();
      // crea la lista a mostrar
      const tableList: OptionItems = {};
      // crea la lista del arreglo
      arrTables.forEach(table => {
        tableList[table.name] = {
          title: table.name,
          description: table.date.toDateString()
        };
      });
      conv.ask(
        "Estas son las tablas en la base de datos. Son " +
          arrTables.length +
          " tablas"
      );
      // Create a list
      conv.ask(
        new List({
          title: "Lista de Tablas",
          items: tableList
        })
      );
    });
    // seleccionar un item de la lista anterior
    /**
     * @param conv es la pregunta
     * @param option es el item select tableList[table.name]
     */
    app.intent("select-general-table", async (conv, params, option) => {
      if (!option) {
        conv.ask("No se seleccionó nada");
      } else if (this.tableName === undefined) {
        this.tableName = option.toString();
        const tableSelect: {
          arrSize: number;
          numString: number;
          numNumber: number;
        } = await this.getOne(option.toString());
        conv.ask("Esta es la información de la tabla seleccionada  ");
        conv.ask(
          new BasicCard({
            title: "Esta es la información de " + option.toString(),
            text: `**Numero de Elementos:**
                    ${tableSelect.arrSize}  \n ***Tipo Caracter:*** ${
              tableSelect.numString
            } elementos  \n ***Tipo Numérico:*** ${
              tableSelect.numNumber
            } elementos `,
            image: new Image({
              url: "http://theartezan.xyz/data-storage.png",
              alt: "Image alternate text"
            })
          })
        );
        conv.ask(new Suggestions(["Ver Detalles", "Cancelar"]));
        // DETALLES ITEM
      } else if (this.tableName !== undefined) {
        const strResult = await this.getOneById(option.toString());
        conv.ask("Esta es la información del elemento seleccionado");
        conv.ask(
          new BasicCard({
            title: "Esta es la información",
            text: strResult
          })
        );
        conv.ask(new Suggestions(["Ver otro elemento", "Salir"]));
      }
    });
    // ver detalles de tabla
    app.intent("detail-general-table", async conv => {
      const arrTop5: {}[] = await this.getTop5(this.tableName);
      const arr = [];
      const keys = Object.keys(arrTop5[0]);
      // crea la lista a mostrar
      const tableList: OptionItems = {};
      // crea la lista del arreglo
      arrTop5.forEach((table, i) => {
        tableList[table[keys[0]].toString()] = {
          title: `${table[keys[0]]}`,
          description: `Elemento ${i + 1}  \n${keys[2]}: ${table[keys[2]]}`
        };
      });
      conv.ask("Estos son algunos elementos en la tabla");
      // Create a list
      conv.ask(
        new List({
          title: "Elementos en " + this.tableName,
          items: tableList
        })
      );
    });
    //  Fin de intentos
    // !!! exportar app, use sirve para cualquier request
    this.router.use("/", app);
  }
  // Helpers para llamar a la BD
  /**
   * Regresa nombre y fecha de las tablas del usuario https://black-box-api.herokuapp.com/dialog
   */
  public async getGeneralTables(): Promise<{ name: string; date: Date }[]> {
    // crea un promise para responder
    const promise = new Promise<{ name: string; date: Date }[]>(
      (resolve, reject) => {
        // usuario
        const username: string = "cesar@correo.com";
        // busca por email las tablas
        User.findOne({ email: username })
          .then(data => {
            // recorre el arreglo de las tablas
            const arrNamesTables: { name: string; date: Date }[] = [];
            data.tables.forEach((table, i) => {
              // las guarda en la respuesta
              arrNamesTables[i] = table;
            });
            resolve(arrNamesTables);
          })
          .catch(error => {});
      }
    );
    // espera a que se resuelva la promesa para responder
    const result = await promise;
    return result;
  }
  /**
   * Funcion para trae info de item en especial
   * @param name item select
   */
  public async getOne(tableName: string) {
    const promise = new Promise<any>((resolve, reject) => {
      // busca la info
      try {
        connection.db
          // busca por el nombre
          .collection(tableName)
          .find({})
          .toArray((err, result) => {
            // inicia operaciones para el resumen
            const arrSize = result.length;
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
              numString: numString,
              numNumber: numNumber
            };
            // termina operaciones y manda el promise
            resolve(data);
          });
        // si no encuentra error
      } catch (error) {
        // error
      }
    });
    const result = await promise;
    return result;
  }
  public async getTop5(tableName: string): Promise<any[]> {
    const promise = new Promise<any[]>((resolve, reject) => {
      // busca la info
      try {
        connection.db
          // busca por el nombre
          .collection(tableName)
          .find({})
          .toArray((err, result) => {
            // lista algunos elementos
            const arrTop5: string[] = [];
            result.slice(0, 29).forEach(item => {
              arrTop5.push(item);
            });
            // termina operaciones y manda el promise
            resolve(arrTop5);
          });
        // si no encuentra error
      } catch (error) {
        // error
      }
    });
    const result = await promise;
    return result;
  }
  public async getOneById(id: string): Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
      // busca la info
      try {
        const itemId = id;
        connection.db
          .collection(this.tableName)
          .find({ _id: Types.ObjectId(itemId) })
          .toArray((err, result) => {
            const arrStr: string[] = [];
            Object.keys(result[0]).forEach(key => {
              if (key !== "_id") {
                arrStr.push(`▪ **${key}**: ${result[0][key]}`);
              }
            });
            const strResult = arrStr.join("  \n");
            resolve(strResult);
          });
        // si no encuentra error
      } catch (error) {
        // error
      }
    });
    const result = await promise;
    return result;
  }
}
