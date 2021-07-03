import { SavHeader } from "./SavHeader";
import { SysVar } from "./SysVar";

export class SavMeta{

    constructor(){
        this.header = new SavHeader();
        this.sysvars = [];
        this.valueLabels = [];
    }

    public header: SavHeader;
    public sysvars: SysVar[];
    public valueLabels: any[];
    public firstRecordPosition: number;

    // getValueLabels(varname: string) : any{
    //     var vl = this.valueLabels.find((vl : any) => vl.appliesTo.includes(varname));
    //     return ( vl != null ) ? vl.entries : null;
    // }

}
