"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavMeta = void 0;
const SavHeader_1 = require("./SavHeader");
class SavMeta {
    constructor() {
        this.header = new SavHeader_1.SavHeader();
        this.sysvars = [];
        this.valueLabels = [];
    }
}
exports.SavMeta = SavMeta;
