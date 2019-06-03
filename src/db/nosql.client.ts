import { Datastore, Query } from "@google-cloud/datastore";
import { IError, ErrorTypes } from "@lib/error.interface";
import { PROJECT_ID } from "@base/authentication/authentication.service";
import * as path from "path";

/**
 * mediates communication with the google cloud noSQL datastore 
 *  for persistent storate
 */
export class NoSqlClient {
    /**
     * singleton instance
     */
    private static _instance: NoSqlClient;
    public static get Instance() {
        if (!this._instance) this._instance = new NoSqlClient();
        return this._instance;
    }

    public datastore: Datastore;

    private constructor() { 
        this.datastore = new Datastore({
            projectId: PROJECT_ID,
            keyFilename: "" // TODO: add key file?
        });
        console.log("Datastore initialized");
    }

    /** retrieve id from a data object */
    public async getIdFromData(data: any): Promise<string> {
        return (data[Datastore.KEY].id).toString();
    }

    /** called by models to run specific queries */
    public async runQueryForModel(query: Query): Promise<any> {
        let queryRun = await this.datastore.runQuery(query);
        return queryRun;
    }

    /** get an entire collection (every instance of a resource) */
    public async datastoreGetCollection(_kind: string): Promise<any> {
        console.log("getting " + _kind);
        const query: Query = this.datastore.createQuery(_kind);
        console.log("running query");
        let queryResult: any[] = await this.datastore.runQuery(query)
        queryResult = queryResult[0];
        return queryResult;
    }   

    /** get a single instance of a resource by it's unique id */
    public async datastoreGetById(_kind: string, entityId: string)
        : Promise<any> {
        const _key = this.datastore.key([_kind, parseInt(entityId, 10)]);
        let [retrieved] = await this.datastore.get(_key).catch(() => {
            return <IError>{ error_type: ErrorTypes.NOT_FOUND }
        });
        return retrieved;
    }

    /** save an item to the datastore */
    public async datastoreSave(_kind: string, entityData: any): Promise<any> {
        const _key = this.datastore.key(_kind);
        const item = {
            key: _key,
            data: entityData
        }
        await this.datastore.save(item);
        return _key;
    }

    /** upsert an item into the datastore */
    public async datastoreUpsert(entityData: any): Promise<any> {
        await this.datastore.upsert(entityData);
    }

    /** edit an item in the datastore */
    public async datastoreEdit(_kind: string, _id: string, _patch: object)
        : Promise<any> {
        const entity = await this.datastoreGetById(_kind, _id);

        for (let editField of Object.keys(_patch)) {
            if (editField !== "id") {
                Object.assign(entity, { [editField]: _patch[editField] });
            }
        }
        
        let editSaved = await this.datastore.upsert(entity);
        return entity;
    }

    /** delete an item from the datastore */
    public async datastoreDelete(_kind: string, _id: string): Promise<any> {
        const _key = this.datastore.key([_kind, parseInt(_id, 10)]);
        if (_key == undefined || _key.id == undefined) {
            return <IError>{ error_type: ErrorTypes.NOT_FOUND }
        }
        let deleted = await this.datastore.delete(_key);
        return deleted;
    }
}