"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mammoth = require("mammoth");
const multer = require("multer");
const uploadService = multer({ storage: multer.memoryStorage() });
class LF {
    countWords2(sentence) {
        const index = {};
        const words = sentence
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
        return index;
    }
}
LF.Instance = function () {
    if (this._instance) {
        return this._instance;
    }
    else {
        return (this._instance = new this());
    }
};
class FileUpload {
    // public Instance = function() {
    //   if (this._instance) {
    //     return this._instance;
    //   } else {
    //     return (this._instance = new this());
    //   }
    // };
    constructor() {
        this.router = express_1.Router();
        this.routes();
    }
    all(req, res) {
        const t = this;
        const buffer = req.file.buffer;
        mammoth
            .extractRawText({ buffer: req.file.buffer })
            .then(result => {
            const text = result.value; // The raw text
            const messages = result.messages;
            const index = LF.Instance().countWords2(text);
            res.status(200).json({ data: index });
        })
            .done();
    }
    countWords(sentence) {
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
        const result = promise;
        return result;
    }
    countWords2(sentence) {
        const index = {};
        const words = sentence
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
        return index;
    }
    routes() {
        this.router.post("/", uploadService.single("file"), this.all);
        // .post("/", uploadService.single("file"), this.all)
        // .bind(FileUpload);
        // this.router.get("/:username", this.one);
        // this.router.post("/", this.create);
        // this.router.put("/:username", this.update);
        // this.router.delete("/:username", this.delete);
    }
}
exports.FileUpload = FileUpload;
//# sourceMappingURL=Files.js.map