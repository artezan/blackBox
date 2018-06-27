"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        default: "",
        required: true
    },
    password: {
        type: String,
        default: ""
    },
    tables: {
        type: Array,
        default: []
    }
}, { strict: false });
exports.default = mongoose_1.model("user-tesis", UserSchema, "user-tesis");
//# sourceMappingURL=User.js.map