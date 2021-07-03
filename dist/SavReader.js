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
exports.SavReader = exports.ValueLabelDict = void 0;
const ChunkReader_1 = require("./ChunkReader");
const SavRow_1 = require("./SavRow");
const SavMetaLoader_1 = require("./SavMetaLoader");
class ValueLabelDict {
}
exports.ValueLabelDict = ValueLabelDict;
class SavReader {
    constructor(filename) {
        this.filename = filename;
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            this.reader = new ChunkReader_1.ChunkReader(this.filename);
            //await this.reader.open();
            // check file type
            if ((yield this.reader.readString(4)) != "$FL2") {
                throw new Error("Not a valid .sav file");
            }
            else {
                console.log('yep, correct file type');
            }
            // load metadata (variable names, # of cases (if specified), variable labels, value labels, etc.)
            let metaLoader = new SavMetaLoader_1.SavMetaLoader(this.reader);
            console.log('metaLoader', metaLoader);
            this.meta = yield metaLoader.load();
            //this.meta = metaLoader.meta;
            this.rowIndex = 0;
            console.log('hi');
        });
    }
    resetRows() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    readNextRow() {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                console.log('reading next row...');
                const row = new SavRow_1.SavRow();
                resolve(row);
            });
            return promise;
        });
    }
}
exports.SavReader = SavReader;
