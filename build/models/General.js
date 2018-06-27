"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// tslint:disable object-literal-sort-keys
const GeneralSchema = new mongoose_1.Schema({
    n: { type: Number, default: 10 }
});
exports.default = mongoose_1.model("General", GeneralSchema);
//# sourceMappingURL=General.js.map