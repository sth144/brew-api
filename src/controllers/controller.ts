export abstract class ReadOnlyController {
    constructor() { }

    abstract async handleGet(request: object): Promise<object>;
}

export abstract class WriteOnlyController {
    constructor() { }

    abstract async handlePost(request: object): Promise<object>
}

/**
 * base controller class
 */
export abstract class Controller extends ReadOnlyController {
    constructor() { 
        super();
    }

    abstract async handlePost(request: object): Promise<object>;
    abstract async handleDelete(request: object): Promise<object>;

    /** optional methods */
    //abstract async handlePatch?(request: object): Promise<object>;
    //abstract async handlePut?(request: object): Promise<object>;
}
