import { ChunkReader } from './ChunkReader';
import { SavRow } from './SavRow';
import { SavMeta } from './SavMeta';
import { SavMetaLoader } from './SavMetaLoader';



export class ValueLabelDict{

}



export class SavReader{

    constructor(filename: string) {
        this.filename = filename;
    }

    public filename: string;

    private reader: any;

    private rowIndex: number;

    private meta: SavMeta;

    public async open(): Promise<any> {
        
        this.reader = new ChunkReader(this.filename);
        //await this.reader.open();

        // check file type
        if( await this.reader.readString(4) != "$FL2" ){
            throw new Error("Not a valid .sav file");
        }
        else {
            console.log('yep, correct file type');
        }

        // load metadata (variable names, # of cases (if specified), variable labels, value labels, etc.)
        let metaLoader = new SavMetaLoader(this.reader);
        console.log('metaLoader', metaLoader);
        this.meta = await metaLoader.load();
        //this.meta = metaLoader.meta;

        this.rowIndex = 0;

        console.log('hi');

    }

    public async resetRows() {

    }

    public async readNextRow(): Promise<SavRow> {
        
        const promise = new Promise((resolve: any, reject: any) => {
            console.log('reading next row...');
            const row = new SavRow();
            resolve(row);
        })
        return promise;

    }

}