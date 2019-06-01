import { IRequest } from "@lib/request.interface";
import { isError, IError } from "@lib/error.interface";

export abstract class RouterWrapper {
    handleError: Function;

    protected constructor() { }

    protected abstract setupRoutes(): void;

    public attachErrorCallback(_errorHandler: Function): void {
        this.handleError = _errorHandler;
    }
    
    protected async directRequest(request: any, response: any, handler: Function, successCallback
        : Function): Promise<void> {
        handler(request).then((result) => {
            if (isError(result)) {
                this.handleError(result as IError, request, response);
            } else {
                successCallback(request, response, result);
            }
        })
    };
}