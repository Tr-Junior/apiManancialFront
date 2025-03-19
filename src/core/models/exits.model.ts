export class Exits {
  constructor(
    public _id: string,
    public description: string,
    public value: number,
    public formPaymentExit: string,
    public date: Date
  ) { }
}
