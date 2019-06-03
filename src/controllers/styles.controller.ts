import { Controller } from "./controller";
import { IRequest } from "@lib/request.interface";
import { IError, ErrorTypes } from "@lib/error.interface";
import { StylesModel } from "@models/styles.model";


/**
 * validates and processes input for the model
 */
export class StylesController extends Controller {
    private stylesModel: StylesModel = StylesModel.Instance;

    constructor() {
        super();
    }

    /** called by router when a get request is received for styles resource */
    public handleGet = async (request: IRequest): Promise<IError | any> => {
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
        /** enforce data model */
        if (!this.stylesModel.confirmInterface(request.body)) {
            return <IError>{ error_type: ErrorTypes.INTERFACE }
        } else {
            /** create and return key to new styles */
            let newKey = await this.stylesModel.createStyle(/** TODO: */);
            return newKey;
        }
    }

    /** called by router when a patch request received for styles resource */
    public handlePatch = async (request: IRequest): Promise<IError | any> => {
        if (request.params.style_id) {
            /** construct edit from request */
            const edit = this.buildEditFromRequest(request);

            let editConfirmed = await this.stylesModel.editStyle(
                request.params.style_id, edit);
            return editConfirmed;
        } return <IError>{ error_type: ErrorTypes.NO_ID };        
    }

    /** called by router when delete request received for for styles resource */
    public handleDelete = async (request: IRequest): Promise<IError | any> => {
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
        
        // TODO: build edit
        
        return _edit;
    }
}