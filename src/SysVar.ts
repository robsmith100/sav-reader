export class SysVar{

    public name: string = undefined;
    public label: string = undefined;
    public type: string = undefined;

    /** @internal */
    public shortName: string = undefined;

    /** @internal */
    public stringExt: number = undefined;

    public missing: any = undefined;
    public printFormat: any = undefined;
    public writeFormat: any = undefined;
    public len: number = undefined;
    public nbMissingValues: number;
}
