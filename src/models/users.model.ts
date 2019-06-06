import { Model } from "./model";
import { IError, ErrorTypes, isError } from "@lib/error.interface";
import { API_URL } from "@routes/urls";
import { NoSqlClient } from "@db/nosql.client";

export interface IUserPrototype {
    id?: string,
    username: string,
    auth0id: string,
    self?: string
}

export interface IUserResult {
    id: string,
    username: string,
    auth0id: string,
    // TODO: implement storing of user recipes
    recipes: {id: string, self: string}[]
    //jwt: string,
    self: string
}

export const USERS = "USERS";

export class UsersModel extends Model {
    private static _instance: UsersModel;
    public static get Instance(): UsersModel {
        if (!this._instance) this._instance = new UsersModel();
        return this._instance;
    }

    protected nosqlClient: NoSqlClient = NoSqlClient.Instance;

    private constructor() { 
        super();
    }

    public async nameUnique(_testName: string): Promise<boolean> {
        /** get all names */
        let allUsers = await this.getAllUsers() as IUserResult[];
        if (!isError(allUsers)) {
            /** check against each name */
            for (let user of allUsers) 
                if (_testName == user.username) 
                    return false;
        }
        /** name is unique */
        return true;
    }

    public confirmInterface(obj: any): boolean {
        if (   !("username" in obj) || !("password" in obj) 
            || !(typeof obj.username === "string")
            || !(typeof obj.password === "string")) return false;
        return true;
    }

    public async createUser(_username: string, _auth0id: string): Promise<any> {
        const newData: Partial<IUserPrototype> = {
            username: _username,
            auth0id: _auth0id
        };

        let newKey = await this.nosqlClient.datastoreSave(USERS, newData);

        Object.assign(newData, { id: `${newKey}` });
        Object.assign(newData, { self: `${API_URL}/${USERS}/${newKey}` });

        const newUser = {
            key: newKey,
            data: newData
        }

        await this.nosqlClient.datastoreUpsert(newUser);

        return newKey
    }

    public async userExistsById(_id: string): Promise<boolean> {
        let result = await this.getUserById(_id);
        if (isError(result)) return false;
        return true;
    }

    public async getUserById(userId: string): Promise<IUserResult | IError> {
        let user = await this.nosqlClient.datastoreGetById(USERS, userId);
        if (user == undefined) return <IError>{ error_type: ErrorTypes.NOT_FOUND }

        return user;
    }

    /**
     * retrieve entire collection (all USERS)
     */
    public async getAllUsers(): Promise<IUserResult[] | IError> {
        let allShips = await this.nosqlClient.datastoreGetCollection(USERS);
        if (allShips == undefined) return <IError>{ error_type: ErrorTypes.NOT_FOUND }
        return allShips;
    }

    public async editUser(userId: string, editUser: Partial<IUserPrototype>) {
        // TODO: should you really be able to edit a user?...
        if (await this.userExistsById(userId)) {
            const edited = await this.nosqlClient.datastoreEdit(
                USERS, userId, editUser);
            return edited;
        } return <IError>{ error_type: ErrorTypes.NOT_FOUND }
    }

    // TODO: method to remove recipe from user?

    public async deleteUser(userId: string) {
        this.nosqlClient.datastoreDelete(USERS, userId)
            .then(() => {
                for (let deleteCallback of this.deleteCallbacks) {
                    deleteCallback(userId);
                }
            });
    }
}