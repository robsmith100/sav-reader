export class DictionaryTerminationRecord{

    static async read(reader: any){
        await reader.readInt32(); // read filler
    }

}
