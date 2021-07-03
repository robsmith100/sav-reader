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
exports.HeaderRecord = void 0;
class HeaderRecord {
    static read(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            // the product that created the file, e.g., @(#) IBM SPSS STATISTICS 64-bit MS Windows 23.0.0.0
            const product = yield reader.readString(60, true);
            // I don't know what the layout code is. Somewhere I saw it suggested
            // that it determines endianness, but I thought info records determined that.
            const layout_code = yield reader.readInt32();
            // Number of data elements per case. This is the number of variables, except that long string variables
            // add extra data elements (one for every 8 characters after the first 8). When reading system files, 
            // PSPP will use this value unless it is set to -1, in which case it will determine the number of data
            // elements by context. When writing system files PSPP always uses this value. 
            const case_size = yield reader.readInt32();
            // true if the data in the file is compressed, false otherwise.
            const compressed = (yield reader.readInt32()) == 1;
            // If one of the variables in the data set is used as a weighting variable, set to the index of that
            // variable. Otherwise, set to 0. 
            const weightIndex = yield reader.readInt32();
            // Set to the number of cases in the file if it is known, or -1 otherwise. 
            // In the general case it is not possible to determine the number of cases that will be output to a
            // system file at the time that the header is written. The way that this is dealt with is by writing
            // the entire system file, including the header, then seeking back to the beginning of the file and
            // writing just the ncases field. For 'files' in which this is not valid, the seek operation fails.
            // In this case, ncases remains -1.
            const n_cases = yield reader.readInt32();
            // Compression bias. Always set to 100. The significance of this value is that only numbers between
            // (1 - bias) and (251 - bias) can be compressed.
            const bias = yield reader.readDouble();
            // (9 chars)
            // Set to the date of creation of the system file, in dd mmm yy format, with the month as
            // standard English abbreviations, using an initial capital letter and following with lowercase.
            // If the date is not available then this field is arbitrarily set to 01 Jan 70. 
            const creationDate = yield reader.readString(9);
            // (8 chars)
            // Set to the time of creation of the system file, in hh:mm:ss format and using 24-hour time. If the
            // time is not available then this field is arbitrarily set to 00:00:00. 
            const creationTime = yield reader.readString(8);
            // (64 chars)
            // Set the the file label declared by the user, if any. Padded on the right with spaces.
            const fileLabel = yield reader.readString(64, true);
            // (3 chars)
            // Ignored padding bytes to make the structure a multiple of 32 bits in length. Set to zeros. 
            yield reader.readString(3); // padding
            // now to return a readable json version of the header data read above
            var record = {
                product,
                encoding: null,
                created: new Date(creationDate + ' ' + creationTime).toISOString(),
                fileLabel,
                case_size,
                weightIndex,
                weight: null,
                n_vars: null,
                n_cases,
                compression: null
            };
            if (compressed) {
                record.compression = {
                    bias
                };
            }
            // delete filelabel if empty since I've rarely seen it populated
            if (record.fileLabel == '' || record.fileLabel == null) {
                delete (record.fileLabel);
            }
            return record;
        });
    }
}
exports.HeaderRecord = HeaderRecord;
//module.exports = HeaderRecord;
