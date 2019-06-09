import { Controller } from "./controller";
import { IRequest } from "@lib/request.interface";
import { IError, ErrorTypes } from "@lib/error.interface";
import { StylesModel } from "@models/styles.model";


/**
 * validates and processes input for the model
 */
export class StylesController extends Controller {
    private stylesModel: StylesModel = StylesModel.Instance;

    constructor(acceptTypes: string[]) {
        super(acceptTypes);
    }

    /** called by router when a get request is received for styles resource */
    public handleGet = async (request: IRequest): Promise<IError | any> => {
        if (this.acceptTypes.indexOf(request.headers.accept) === -1) {
            return <IError>{ error_type: ErrorTypes.BAD_MEDIA_TYPE }
        }

        let result = {};
        if (!request.params.style_id) {
            /** all styles selected */
            if (request.query.pag && request.query.pag == "false") {
                result = await this.stylesModel.getAllStyles();
            } else {
                let _cursor = undefined;
                if (request.query.cursor) {
                    _cursor = request.query.cursor.replace(/ /g, "+");
                }
                result = await this.stylesModel.getAllStylesPaginated(_cursor);
            }
        } else {
            /** one particular styles item selected */
            result = await this.stylesModel.getStyleById(request.params.style_id);
        }
        return result;
    }

    /** called by router when a post request received for styles resource */
    public handlePost = async (request: IRequest): Promise<IError | any> => {
        if (this.acceptTypes.indexOf(request.headers.accept) === -1) {
            return <IError>{ error_type: ErrorTypes.BAD_MEDIA_TYPE }
        }
        
        /** enforce data model */
        if (!this.stylesModel.confirmInterface(request.body)) {
            return <IError>{ error_type: ErrorTypes.INTERFACE }
        } else {
            /** create and return key to new styles */
            const newKey = await this.stylesModel.createStyle(
                request.body.name, request.body.category, request.body.ibu, request.body.abv);
            return newKey;
        }
    }

    /** called by router when a put request received for styles resource */
    public handlePut = async (request: IRequest): Promise<IError | any> => {
        if (this.acceptTypes.indexOf(request.headers.accept) === -1) {
            return <IError>{ error_type: ErrorTypes.BAD_MEDIA_TYPE }
        }
        
        if (request.params.style_id) {
            /** construct edit from request */
            const edit = this.buildEditFromRequest(request);

            const editConfirmed = await this.stylesModel.editStyle(
                request.params.style_id, edit);
            return editConfirmed;
        } return <IError>{ error_type: ErrorTypes.NO_ID };        
    }

    /** called by router when delete request received for for styles resource */
    public handleDelete = async (request: IRequest): Promise<IError | any> => {
        if (this.acceptTypes.indexOf(request.headers.accept) === -1) {
            return <IError>{ error_type: ErrorTypes.BAD_MEDIA_TYPE }
        }
        
        /** confirm id in request */
        if (request.params.style_id) {
            /**
             * return confirmation to route handler
             *  
             */
            let deleteConfirmed
                = await this.stylesModel.deleteStyle(request.params.style_id)    
            return deleteConfirmed;
        } return <IError>{ error_type: ErrorTypes.NO_ID }
    }

    /** construct edit object to pass to model (for patching) */
    private buildEditFromRequest(_request: IRequest): object {
        const _edit = {};
        if (_request.body.name)
            Object.assign(_edit, { name: _request.body.name });
        if (_request.body.category)
            Object.assign(_edit, { category: _request.body.category });
        if (_request.body.ibu)
            Object.assign(_edit, { ibu: _request.body.ibu });
        if (_request.body.abv)
            Object.assign(_edit, { abv: _request.body.abv });
        return _edit;
    }
}