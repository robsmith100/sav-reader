"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueLabelRecord = void 0;
class ValueLabelRecord {
    static read(reader, sysvars) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = reader;
            let set = {
                appliesTo: [],
                entries: []
            };
            // determine the number of value/label pairs
            let count = yield r.readInt32();
            // read the value/label pairs
            for (let i = 0; i < count; i++) {
                // get value
                let val = yield r.readDouble();
                // get label
                let labelLen = yield r.readByte();
                let label = labelLen > 0 ? yield r.readString(labelLen) : "";
                if ((labelLen + 1) % 8 != 0) {
                    let padding = 8 - ((labelLen + 1) % 8);
                    yield r.readString(padding);
                }
                set.entries.push({
                    val: val,
                    label
                });
            }
            // check to see if next record is a value label variable record
            let next_rec_type = yield r.peekByte();
            if (next_rec_type == 4) {
                // value label variable record
                // this records tells us the variables which should use the preceding valuelabelset
                yield r.readInt32(); // consume record type
                let nbVars = yield r.readInt32();
                // read in vars
                for (let i = 0; i < nbVars; i++) {
                    // read varindex
                    let varIndex = yield r.readInt32(); // 1-based var index
                    // find variable
                    let sysvar = sysvars[varIndex - 1];
                    set.appliesTo.push(sysvar.shortName);
                }
                return set;
            }
            return null; // because it didn't apply to any vars
        });
    }
}
exports.ValueLabelRecord = ValueLabelRecord;
//module.exports = ValueLabelRecord;
