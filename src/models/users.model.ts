import { Model } from "./model";

// TODO: create user model
export interface IUserPrototype {
    id?: string,
    username: string,
    password: string,
    jwt?: string,
    self?: string
}

export interface IUserResult {
    id: string,
    username: string,
    password: string,
    jwt: string,
    self: string
}

export class UsersModel extends Model {

    constructor() { 
        super();
    }

    public confirmInterface(obj: any): boolean {
        // TODO: implement confirm interface
        return true;
    }
}