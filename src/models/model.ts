import { NoSqlClient } from "@db/nosql.client";

/**
 * base class for data models
 */
export abstract class Model {
    protected nosqlClient: NoSqlClient;
    protected deleteCallbacks: Function[] = [];

    constructor() { }

    protected abstract confirmInterface(obj: object): boolean;

    /**
     * register a callback to be called when a boat is deleted
     */
    public registerDeleteCallback(_cb: Function): void {
        this.deleteCallbacks.push(_cb);
    }
}