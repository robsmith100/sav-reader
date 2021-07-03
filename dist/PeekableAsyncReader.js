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
exports.PeekableAsyncReader = void 0;
const AsyncReader_1 = require("./AsyncReader");
//var AsyncReader = require('./AsyncReader');
/**
 * Wraps AsyncReader to provide peek functionality
 */
class PeekableAsyncReader {
    constructor(filename, highWaterMark = undefined) {
        this.reader = new AsyncReader_1.AsyncReader(filename, highWaterMark);
        this.peekedBytes = null;
        this.read = this.read.bind(this);
    }
    /** Get position at which next read will occur */
    getPosition() {
        let peekedBytesLength = this.peekedBytes == null ? 0 : this.peekedBytes.length;
        return this.reader.position - peekedBytesLength;
    }
    isAtEnd() {
        return this.reader.isAtEnd();
    }
    /** Close stream, after which no further reading is allowed */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.reader.close();
        });
    }
    /** Returns len bytes from the stream without adjusting the read position
     * @param len Number of bytes to peek and return
     */
    peek(len) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.reader.read(len)
                    .then((buf) => {
                    this.peekedBytes = (this.peekedBytes == null) ? buf : this.peekedBytes + buf;
                    resolve(buf);
                })
                    .catch(reject);
            });
        });
    }
    /** Returns a string with len bytes
     * @param len Number of bytes to read
     */
    read(len) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.peekedBytes == null)
                return this.reader.read(len);
            return new Promise((resolve, reject) => {
                let peekedLen = this.peekedBytes.length;
                if (len < peekedLen) {
                    let buf = this.peekedBytes;
                    this.peekedBytes = this.peekedBytes.slice(len);
                    resolve(buf.slice(0, len));
                }
                else if (len == peekedLen) {
                    let buf = this.peekedBytes;
                    this.peekedBytes = null;
                    resolve(buf);
                }
                else { // len > peekedLen
                    this.reader.read(len - peekedLen)
                        .then((buf) => {
                        buf = this.peekedBytes + buf;
                        this.peekedBytes = null;
                        resolve(buf);
                    })
                        .catch(reject);
                }
            });
        });
    }
}
exports.PeekableAsyncReader = PeekableAsyncReader;
//module.exports = PeekableAsyncReader
