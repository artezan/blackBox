import { Request, Response, Router } from "express";
import * as fs from "fs";
import * as mammoth from "mammoth";
import * as multer from "multer";
const uploadService = multer({ storage: multer.memoryStorage() });
class LF {
  public static Instance = function(): LF {
    if (this._instance) {
      return this._instance;
    } else {
      return (this._instance = new this());
    }
  };
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

export class FileUpload {
  public router: Router;
  // public Instance = function() {
  //   if (this._instance) {
  //     return this._instance;
  //   } else {
  //     return (this._instance = new this());
  //   }
  // };

  constructor() {
    this.router = Router();
    this.routes();
  }
  public all(req, res: Response) {
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
    const promise = new Promise<any>((resolve, reject) => {
      const index = {};
      const words = sentence
        .replace(/[.,?!;()"'-]/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .split(" ");

      words.forEach(function(word) {
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
  public routes() {
    this.router.post("/", uploadService.single("file"), this.all);
    // .post("/", uploadService.single("file"), this.all)
    // .bind(FileUpload);
    // this.router.get("/:username", this.one);
    // this.router.post("/", this.create);
    // this.router.put("/:username", this.update);
    // this.router.delete("/:username", this.delete);
  }
}
