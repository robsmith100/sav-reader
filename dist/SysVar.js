"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SysVar = void 0;
class SysVar {
    constructor() {
        this.name = undefined;
        this.label = undefined;
        this.type = undefined;
        /** @internal */
        this.shortName = undefined;
        /** @internal */
        this.stringExt = undefined;
        this.missing = undefined;
        this.printFormat = undefined;
        this.writeFormat = undefined;
        this.len = undefined;
    }
}
exports.SysVar = SysVar;
