import { model, Schema, Document } from "mongoose";

const UserSchema: Schema = new Schema(
  {
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
  },
  { strict: false }
);
export interface IUser extends Document {
  createdAt?: Date;
  email?: string;
  password?: string;
  typeDoc?: string;
  tables?: [{ name: string; date: Date; typeDoc?: string }];
}

export default model<IUser>("user-tesis", UserSchema, "user-tesis");
