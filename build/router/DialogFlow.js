"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Google Assistant deps
const actions_on_google_1 = require("actions-on-google");
const User_1 = require("../models/User");
const mongoose_1 = require("mongoose");
class DialogFlow {
    constructor() {
        this.router = express_1.Router();
        this.routes();
    }
    routes() {
        // Inicia google app
        const app = actions_on_google_1.dialogflow();
        // intentos de preguntas
        /**
         * nombre de intent
         * respuesta de la pregunta
         * La funcion es asincrona para esperar a que responda el helper
         */
        app.intent("list-general-tables", (conv) => __awaiter(this, void 0, void 0, function* () {
            this.tableName = undefined;
            // espera al helper que da la info de las tablas
            const arrTables = yield this.getGeneralTables();
            // crea la lista a mostrar
            const tableList = {};
            // crea la lista del arreglo
            arrTables.forEach(table => {
                tableList[table.name] = {
                    title: table.name,
                    description: table.date.toDateString()
                };
            });
            conv.ask("Estas son las tablas en la base de datos. Son " +
                arrTables.length +
                " tablas");
            // Create a list
            conv.ask(new actions_on_google_1.List({
                title: "Lista de Tablas",
                items: tableList
            }));
        }));
        // seleccionar un item de la lista anterior
        /**
         * @param conv es la pregunta
         * @param option es el item select tableList[table.name]
         */
        app.intent("select-general-table", (conv, params, option) => __awaiter(this, void 0, void 0, function* () {
            if (!option) {
                conv.ask("No se seleccionó nada");
            }
            else if (this.tableName === undefined) {
                this.tableName = option.toString();
                const tableSelect = yield this.getOne(option.toString());
                conv.ask("Esta es la información de la tabla seleccionada  ");
                conv.ask(new actions_on_google_1.BasicCard({
                    title: "Esta es la información de " + option.toString(),
                    text: `**Numero de Elementos:**
                    ${tableSelect.arrSize}  \n ***Tipo Caracter:*** ${tableSelect.numString} elementos  \n ***Tipo Numérico:*** ${tableSelect.numNumber} elementos `,
                    image: new actions_on_google_1.Image({
                        url: "http://theartezan.xyz/data-storage.png",
                        alt: "Image alternate text"
                    })
                }));
                conv.ask(new actions_on_google_1.Suggestions(["Ver Detalles", "Cancelar"]));
                // DETALLES ITEM
            }
            else if (this.tableName !== undefined) {
                const strResult = yield this.getOneById(option.toString());
                conv.ask("Esta es la información del elemento seleccionado");
                conv.ask(new actions_on_google_1.BasicCard({
                    title: "Esta es la información",
                    text: strResult
                }));
                conv.ask(new actions_on_google_1.Suggestions(["Ver otro elemento", "Salir"]));
            }
        }));
        // ver detalles de tabla
        app.intent("detail-general-table", (conv) => __awaiter(this, void 0, void 0, function* () {
            const arrTop5 = yield this.getTop5(this.tableName);
            const arr = [];
            const keys = Object.keys(arrTop5[0]);
            // crea la lista a mostrar
            const tableList = {};
            // crea la lista del arreglo
            arrTop5.forEach((table, i) => {
                tableList[table[keys[0]].toString()] = {
                    title: `${table[keys[0]]}`,
                    description: `Elemento ${i + 1}  \n${keys[2]}: ${table[keys[2]]}`
                };
            });
            conv.ask("Estos son algunos elementos en la tabla");
            // Create a list
            conv.ask(new actions_on_google_1.List({
                title: "Elementos en " + this.tableName,
                items: tableList
            }));
        }));
        //  Fin de intentos
        // !!! exportar app, use sirve para cualquier request
        this.router.use("/", app);
    }
    // Helpers para llamar a la BD
    /**
     * Regresa nombre y fecha de las tablas del usuario https://black-box-api.herokuapp.com/dialog
     */
    getGeneralTables() {
        return __awaiter(this, void 0, void 0, function* () {
            // crea un promise para responder
            const promise = new Promise((resolve, reject) => {
                // usuario
                const username = "cesar@correo.com";
                // busca por email las tablas
                User_1.default.findOne({ email: username })
                    .then(data => {
                    // recorre el arreglo de las tablas
                    const arrNamesTables = [];
                    data.tables.forEach((table, i) => {
                        // las guarda en la respuesta
                        arrNamesTables[i] = table;
                    });
                    resolve(arrNamesTables);
                })
                    .catch(error => { });
            });
            // espera a que se resuelva la promesa para responder
            const result = yield promise;
            return result;
        });
    }
    /**
     * Funcion para trae info de item en especial
     * @param name item select
     */
    getOne(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                // busca la info
                try {
                    mongoose_1.connection.db
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
                            }
                            else {
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
                }
                catch (error) {
                    // error
                }
            });
            const result = yield promise;
            return result;
        });
    }
    getTop5(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                // busca la info
                try {
                    mongoose_1.connection.db
                        // busca por el nombre
                        .collection(tableName)
                        .find({})
                        .toArray((err, result) => {
                        // lista algunos elementos
                        const arrTop5 = [];
                        result.slice(0, 29).forEach(item => {
                            arrTop5.push(item);
                        });
                        // termina operaciones y manda el promise
                        resolve(arrTop5);
                    });
                    // si no encuentra error
                }
                catch (error) {
                    // error
                }
            });
            const result = yield promise;
            return result;
        });
    }
    getOneById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                // busca la info
                try {
                    const itemId = id;
                    mongoose_1.connection.db
                        .collection(this.tableName)
                        .find({ _id: mongoose_1.Types.ObjectId(itemId) })
                        .toArray((err, result) => {
                        const arrStr = [];
                        Object.keys(result[0]).forEach(key => {
                            if (key !== "_id") {
                                arrStr.push(`▪ **${key}**: ${result[0][key]}`);
                            }
                        });
                        const strResult = arrStr.join("  \n");
                        resolve(strResult);
                    });
                    // si no encuentra error
                }
                catch (error) {
                    // error
                }
            });
            const result = yield promise;
            return result;
        });
    }
}
exports.DialogFlow = DialogFlow;
//# sourceMappingURL=DialogFlow.js.map