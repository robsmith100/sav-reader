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
exports.SavMetaLoader = void 0;
const DictionaryTerminationRecord_1 = require("./records/DictionaryTerminationRecord");
const DocumentRecord_1 = require("./records/DocumentRecord");
const HeaderRecord_1 = require("./records/HeaderRecord");
const InfoRecord_1 = require("./records/InfoRecord");
const ValueLabelRecord_1 = require("./records/ValueLabelRecord");
const VariableRecord_1 = require("./records/VariableRecord");
const SavMeta_1 = require("./SavMeta");
/** Metadata for sav file. Includes variable names, labels, valuelabels, encoding, etc. */
class SavMetaLoader {
    constructor(chunkReader) {
        this.reader = chunkReader;
        this.meta = new SavMeta_1.SavMeta();
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            let r = this.reader;
            // read the header record
            this.meta.header = yield HeaderRecord_1.HeaderRecord.read(r);
            let recent_stringvar = null; // keep most recent string for easy linking of string continuation vars
            let done = false;
            do {
                let rec_type = yield r.peekInt();
                if (rec_type == 2) {
                    // variable record
                    yield r.readInt32(); // consume peeked record type
                    var sysvar = yield VariableRecord_1.VariableRecord.read(r);
                    // a sysvar type of 0 means numeric variable
                    // a sysvar type of -1 means string continuation variable
                    // a sysvar type of > 0 means string variable with length(type)
                    // if( sysvar.type === -1 ){
                    //     // this is a string continuation var
                    //     recent_stringvar.stringExt++;
                    // }
                    // else if( sysvar.type > 0 ){
                    //     // this is a root string var
                    //     sysvar.stringExt = 0;
                    //     recent_stringvar = sysvar;
                    // }
                    // else if( sysvar.type == 0 ){
                    //     // this is a numeric var
                    // }
                    if (sysvar.type === 'string') {
                        // this is a root string var
                        sysvar.stringExt = 0;
                        recent_stringvar = sysvar;
                    }
                    else if (sysvar.type === 'string-cont') {
                        // this is a string continuation var
                        recent_stringvar.stringExt++;
                    }
                    // else if( sysvar.type === 'numeric' ){
                    //     // this is a numeric var
                    // }
                    this.meta.sysvars.push(sysvar);
                }
                else if (rec_type == 3) {
                    // value label record
                    yield r.readInt32(); // consume peeked record type
                    // a value label record contains one set of value/label pairs and is attached to one or more variables
                    let set = yield ValueLabelRecord_1.ValueLabelRecord.read(r, this.meta.sysvars);
                    if (set != null) {
                        this.meta.valueLabels.push(set);
                    }
                }
                else if (rec_type == 6) {
                    // document record (one per file)
                    yield r.readInt32(); // consume peeked record type
                    if (this.documentRecord != null) {
                        throw new Error("Multiple document records encountered");
                    }
                    this.documentRecord = yield DocumentRecord_1.DocumentRecord.read(r);
                }
                else if (rec_type == 7) {
                    // info record (many different subtypes)
                    yield r.readInt32(); // consume peeked record type
                    yield InfoRecord_1.InfoRecord.read(r, this.meta);
                }
                else if (rec_type == 999) {
                    // dictionary termination record
                    yield r.readInt32(); // consume peeked record type
                    yield DictionaryTerminationRecord_1.DictionaryTerminationRecord.read(r);
                    done = true;
                }
                else {
                    // assume implicit dictionary termination
                    done = true;
                }
            } while (!done);
            // save the pointer
            this.meta.firstRecordPosition = r.getPosition();
            // post-process the sysvars
            // lookup weight
            if (this.meta.header.weightIndex != 0) {
                this.meta.header.weight = this.meta.sysvars[this.meta.header.weightIndex - 1].name;
            }
            delete (this.meta.header.weightIndex);
            // remove string continuation vars
            this.meta.sysvars = this.meta.sysvars.filter(x => x.type != 'string-cont');
            this.meta.header.n_vars = this.meta.sysvars.length;
            delete (this.meta.header.case_size);
            // adjust valuelabels map to refer to new names
            this.meta.valueLabels = this.meta.valueLabels.map(set => {
                var set2 = Object.assign({}, set);
                set2.appliesTo = set2.appliesTo.map((shortname) => this.meta.sysvars.find(sysvar => sysvar.shortName == shortname).name);
                return set2;
            });
            // var-specific edits
            this.meta.sysvars = this.meta.sysvars.map(y => {
                var x = Object.assign({}, y);
                delete (x.shortName); // delete short name
                return x;
            });
            return this.meta;
        });
    }
}
exports.SavMetaLoader = SavMetaLoader;
