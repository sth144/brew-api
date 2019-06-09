export abstract class ReadOnlyController {
    protected acceptTypes: string[];

    constructor(acceptTypes: string[]) { 
        this.acceptTypes = acceptTypes;
    }

    abstract async handleGet(request: object): Promise<object>;
}

export abstract class WriteOnlyController {    
    protected acceptTypes: string[];

    constructor(acceptTypes: string[]) { 
        this.acceptTypes = acceptTypes;
    }

    abstract async handlePost(request: object): Promise<object>
}

/**
 * base controller class
 */
export abstract class Controller extends ReadOnlyController {

    constructor(acceptTypes: string[]) { 
        super(acceptTypes);
    }

    abstract async handlePost(request: object): Promise<object>;
    abstract async handleDelete(request: object): Promise<object>;

    /** optional methods */
    //abstract async handlePatch?(request: object): Promise<object>;
    //abstract async handlePut?(request: object): Promise<object>;
}
