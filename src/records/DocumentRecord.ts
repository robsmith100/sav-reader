import { ChunkReader } from "../ChunkReader";


/** There must be no more than one document record per system file. Document
    records must follow the variable records and precede the dictionary termination record.  
    */
export class DocumentRecord{

    static async read(reader: ChunkReader){

        // Number of lines of documents present.
        let n_lines = await reader.readInt32();

        // Document lines. The number of elements is defined by n_lines. Lines shorter than 80 characters are padded on the right with spaces. 
        let lines: string[] = [];
        for( let i = 0; i < n_lines; i++ ){
            lines.push(await reader.readString(80, true));
        }

        return {
            n_lines,
            lines
        }

    }

}

