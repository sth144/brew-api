import { Controller } from "./controller";
import { IRequest } from "@lib/request.interface";
import { IError, ErrorTypes } from "@lib/error.interface";
import { RecipesModel } from "@models/recipes.model";


/**
 * validates and processes input for the model
 */
export class RecipesController extends Controller {
    private recipesModel: RecipesModel = RecipesModel.Instance;

    constructor() {
        super();
    }

    /** called by router when a get request is received for recipes resource */
    public handleGet = async (request: IRequest): Promise<IError | any> => {
        let result = {};
        if (!request.params.recipe_id) {
            /** all recipes selected */
            if (request.query.pag && request.query.pag == "false") {
                result = await this.recipesModel.getAllRecipes();
            } else {
                let _cursor = undefined;
                if (request.query.cursor) {
                    _cursor = request.query.cursor.replace(/ /g, "+");
                }
                result = await this.recipesModel.getAllRecipesPaginated(_cursor);
            }
        } else {
            /** one particular recipes item selected */
            result = await this.recipesModel.getRecipeById(request.params.recipe_id);
        }
        return result;
    }

    /** called by router when a post request received for recipes resource */
    public handlePost = async (request: IRequest): Promise<IError | any> => {
        /** enforce data model */
        if (!this.recipesModel.confirmInterface(request.body)) {
            return <IError>{ error_type: ErrorTypes.INTERFACE }
        } else {
            /** create and return key to new recipes */
            let newKey = await this.recipesModel.createRecipe(/** TODO: */);
            return newKey;
        }
    }

    /** called by router when a patch request received for recipes resource */
    public handlePatch = async (request: IRequest): Promise<IError | any> => {
        if (request.params.recipe_id) {
            /** construct edit from request */
            const edit = this.buildEditFromRequest(request);

            let editConfirmed = await this.recipesModel.editRecipe(
                request.params.recipe_id, edit);
            return editConfirmed;
        } return <IError>{ error_type: ErrorTypes.NO_ID };        
    }

    /** called by router when delete request received for for recipes resource */
    public handleDelete = async (request: IRequest): Promise<IError | any> => {
        /** confirm id in request */
        if (request.params.recipe_id) {
            /**
             * return confirmation to route handler
             *  
             */
            let deleteConfirmed
                = await this.recipesModel.deleteRecipe(request.params.recipe_id)    
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