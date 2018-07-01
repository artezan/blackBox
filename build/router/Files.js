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
const mammoth = require("mammoth");
const multer = require("multer");
const uploadService = multer({ storage: multer.memoryStorage() });
class FileUpload {
    constructor() {
        this.router = express_1.Router();
        this.routes();
    }
    all(req, res) {
        const buffer = req.file.buffer;
        mammoth
            .extractRawText({ buffer: req.file.buffer })
            .then(result => {
            const text = result.value; // The raw text
            const messages = result.messages;
            const index = {};
            const words = text
                .replace(/[.,?!;()"'-]/g, " ")
                .replace(/\s+/g, " ")
                .toLowerCase()
                .split(" ");
            words.forEach(word => {
                if (!index.hasOwnProperty(word)) {
                    index[word] = 0;
                }
                index[word]++;
            });
            res.status(200).json({ data: index });
        })
            .done();
    }
    countWords(sentence) {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                const index = {};
                const words = sentence
                    .replace(/[.,?!;()"'-]/g, " ")
                    .replace(/\s+/g, " ")
                    .toLowerCase()
                    .split(" ");
                words.forEach(function (word) {
                    if (!index.hasOwnProperty(word)) {
                        index[word] = 0;
                    }
                    index[word]++;
                });
                resolve(index);
            });
            const result = yield promise;
            return result;
        });
    }
    routes() {
        this.router.post("/", uploadService.single("file"), this.all);
        // this.router.get("/:username", this.one);
        // this.router.post("/", this.create);
        // this.router.put("/:username", this.update);
        // this.router.delete("/:username", this.delete);
    }
}
exports.FileUpload = FileUpload;
//# sourceMappingURL=Files.js.map