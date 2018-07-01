import { Request, Response, Router } from "express";
import * as fs from "fs";
import * as mammoth from "mammoth";
import * as multer from "multer";
const uploadService = multer({ storage: multer.memoryStorage() });

export class FileUpload {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }
  public all(req, res: Response) {
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
  async countWords(sentence) {
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
    const result = await promise;
    return result;
  }
  public routes() {
    this.router.post("/", uploadService.single("file"), this.all);
    // this.router.get("/:username", this.one);
    // this.router.post("/", this.create);
    // this.router.put("/:username", this.update);
    // this.router.delete("/:username", this.delete);
  }
}
