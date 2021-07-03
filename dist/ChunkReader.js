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
exports.ChunkReader = void 0;
const PeekableAsyncReader_1 = require("./PeekableAsyncReader");
//var PeekableAsyncReader = require('./PeekableAsyncReader')
/** need a more fitting name for this */
class ChunkReader {
    constructor(filename) {
        this.reader = new PeekableAsyncReader_1.PeekableAsyncReader(filename, 1048576);
        this.commandPointer = 0;
        this.commandBuffer = null;
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.reader.close();
        });
    }
    getPosition() {
        return this.reader.getPosition();
    }
    isAtEnd() {
        return this.reader.isAtEnd();
    }
    peek(len) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.reader.peek(len);
        });
    }
    peekByte() {
        return __awaiter(this, void 0, void 0, function* () {
            var buf = yield this.reader.peek(1);
            if (buf != null && buf.length == 1) {
                return buf.charCodeAt(0);
            }
            return null;
        });
    }
    peekInt() {
        return __awaiter(this, void 0, void 0, function* () {
            var buf = yield this.reader.peek(4);
            if (buf != null && buf.length == 4) {
                var result = ((buf.charCodeAt(0)) |
                    (buf.charCodeAt(1) << 8) |
                    (buf.charCodeAt(2) << 16) |
                    (buf.charCodeAt(3) << 24));
                return result;
            }
            return null;
        });
    }
    read(len) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.reader.read(len);
        });
    }
    readInt32() {
        return __awaiter(this, void 0, void 0, function* () {
            var buf = yield this.reader.read(4);
            if (buf != null && buf.length == 4) {
                //return new DataView(buf).getInt32();
                var result = ((buf.charCodeAt(0)) |
                    (buf.charCodeAt(1) << 8) |
                    (buf.charCodeAt(2) << 16) |
                    (buf.charCodeAt(3) << 24));
                return result;
            }
            return null;
        });
    }
    readByte() {
        return __awaiter(this, void 0, void 0, function* () {
            var buf = yield this.reader.read(1);
            if (buf != null && buf.length == 1) {
                return buf.charCodeAt(0);
            }
            return null;
        });
    }
    readDouble() {
        return __awaiter(this, void 0, void 0, function* () {
            var buf = yield this.reader.read(8);
            if (buf != null && buf.length == 8) {
                var ab = new ArrayBuffer(8);
                var bufView = new Uint8Array(ab);
                bufView[0] = buf.charCodeAt(7);
                bufView[1] = buf.charCodeAt(6);
                bufView[2] = buf.charCodeAt(5);
                bufView[3] = buf.charCodeAt(4);
                bufView[4] = buf.charCodeAt(3);
                bufView[5] = buf.charCodeAt(2);
                bufView[6] = buf.charCodeAt(1);
                bufView[7] = buf.charCodeAt(0);
                let dv = new DataView(ab);
                let d = dv.getFloat64(0);
                return d;
            }
            return null;
        });
    }
    getCommandCode() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.commandPointer == 0) {
                // read command bytes from buffer
                this.commandBuffer = yield this.read(8);
            }
            let code = this.commandBuffer.charCodeAt(this.commandPointer);
            this.commandPointer++;
            if (this.commandPointer === 8)
                this.commandPointer = 0;
            return code;
        });
    }
    readDouble2(compression) {
        return __awaiter(this, void 0, void 0, function* () {
            if (compression == null)
                return yield this.readDouble();
            var code = yield this.getCommandCode();
            while (code === 0)
                code = yield this.getCommandCode();
            let d = null;
            if (code > 0 && code < 252) {
                // compressed data
                d = code - compression.bias;
            }
            else if (code == 252) {
                // end of file
            }
            else if (code == 253) {
                // non-compressible piece, read from stream
                d = yield this.readDouble(); // reads from end (since commands have already been read)
            }
            else if (code == 254) {
                // string value that is all spaces
                //d = 0x2020202020202020;
                // shouldn't get here!
                //d = null;
            }
            else if (code == 255) {
                // system-missing
            }
            else if (code == 0) {
                // ignore
            }
            else {
                throw new Error('unknown error reading compressed double');
            }
            return d;
        });
    }
    read8CharString(compression) {
        return __awaiter(this, void 0, void 0, function* () {
            if (compression == null)
                return yield this.readString(8);
            var code = yield this.getCommandCode();
            while (code === 0)
                code = yield this.getCommandCode();
            let str = null;
            if (code > 0 && code < 252) {
                // compressed data
                //d = code - bias;
                // shouldn't get here!
            }
            else if (code == 252) {
                // end of file
            }
            else if (code == 253) {
                // non-compressible piece, read from stream
                str = yield this.readString(8); // reads from end (since commands have already been read)
            }
            else if (code == 254) {
                // string value that is all spaces
                str = '        '; // todo: figure out if this should be empty (len=0)
            }
            else if (code == 255) {
                // system-missing
            }
            else if (code == 0) {
                // ignore
            }
            else {
                throw new Error('unknown error reading compressed string');
            }
            return str;
        });
    }
    readString(len, trimEnd = false) {
        return __awaiter(this, void 0, void 0, function* () {
            var buf = yield this.reader.read(len);
            if (buf != null && buf.length == len) {
                return trimEnd ? buf.trimEnd() : buf;
            }
        });
    }
    readBytes(len) {
        return __awaiter(this, void 0, void 0, function* () {
            var buf = yield this.reader.read(len);
            if (buf != null && buf.length == len) {
                return buf;
            }
        });
    }
}
exports.ChunkReader = ChunkReader;
//module.exports = ChunkReader;
