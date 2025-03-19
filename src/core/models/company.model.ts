export interface IAddress {
  zip: string;
  backYard: string;
  neighborhood: string;
  addressLine: string;
  addressLine2: string;
  city: string;
  state: string;
}

export interface IContact {
  telephone: string;
  email: string;
}

export interface ICompany {
  _id: string;
  name: string;
  cnpj: string;
  address: IAddress;
  contact: IContact;
}
