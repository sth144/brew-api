import { Controller } from "./controller";
import { IRequest } from "@lib/request.interface";
import { IError, ErrorTypes } from "@lib/error.interface";
import { RecipesModel, IRecipeResult } from "@models/recipes.model";
import { AuthenticationService } from "@base/authentication/authentication.service";
import { UsersModel, IUserResult } from "@models/users.model";
import { isError } from "util";

/**
 * validates and processes input for the model
 */
export class RecipesController extends Controller {
    private recipesModel: RecipesModel = RecipesModel.Instance;
    private usersModelRef: UsersModel = UsersModel.Instance;

    constructor(acceptTypes: string[]) {
        super(acceptTypes);
    }

    /** called by router when a get request is received for recipes resource */
    public handleGet = async (request: IRequest): Promise<IError | any> => {
        if (this.acceptTypes.indexOf(request.headers.accept) === -1) {
            return <IError>{ error_type: ErrorTypes.BAD_MEDIA_TYPE }
        }
        
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
        if (this.acceptTypes.indexOf(request.headers.accept) === -1) {
            return <IError>{ error_type: ErrorTypes.BAD_MEDIA_TYPE }
        }
        
        /** enforce data model */
        if (!this.recipesModel.confirmInterface(request.body)) {
            return <IError>{ error_type: ErrorTypes.INTERFACE }
        } else {
            const decoded = AuthenticationService.Instance.decodeJwt(
                request.headers.authorization); 
            if (decoded === undefined) { return <IError>{ error_type: ErrorTypes.UNAUTHORIZED } }
            const ownerIs = decoded.nickname
            if (ownerIs === undefined) { return <IError>{ error_type: ErrorTypes.UNAUTHORIZED } }
            /** create and return key to new recipes */
            let newKey = await this.recipesModel.createRecipe(
                request.body.style, request.body.malt, request.body.hops, 
                request.body.yeast, ownerIs);
            return newKey;
        }
    }

    /** called by router when a put request received for recipes resource */
    public handlePut = async (request: IRequest): Promise<IError | any> => {
        if (this.acceptTypes.indexOf(request.headers.accept) === -1) {
            return <IError>{ error_type: ErrorTypes.BAD_MEDIA_TYPE }
        }
        
        if (request.params.recipe_id) {
            const decoded = AuthenticationService.Instance.decodeJwt(
                request.headers.authorization); 
            if (decoded === undefined) { return <IError>{ error_type: ErrorTypes.UNAUTHORIZED } }
            const nameShouldBe = decoded.nickname
            
            if (nameShouldBe === undefined) { return <IError>{ error_type: ErrorTypes.UNAUTHORIZED } }
            
            const allUsers = await this.usersModelRef.getAllUsers();
            if (!isError(allUsers)) {
                const usersFiltered = (allUsers as IUserResult[])
                    .filter(x => x.username === nameShouldBe);
                if (usersFiltered.length) {
                    let user = usersFiltered[0];
                    const recipe = await this.recipesModel.getRecipeById(request.params.recipe_id);
                    if (isError(recipe)) return <IError>{ error_type: ErrorTypes.NOT_FOUND }
                    else {
                        if (user.id === (recipe as IRecipeResult).owner.id) {
                            /** construct edit from request */
                            const edit = this.buildEditFromRequest(request);

                            let editConfirmed = await this.recipesModel.editRecipe(
                                request.params.recipe_id, edit);
                            return editConfirmed;
                        } return <IError>{ error_type: ErrorTypes.FORBIDDEN }
                    }
                } 
            } return <IError>{ error_type: ErrorTypes.NOT_FOUND }
        } return <IError>{ error_type: ErrorTypes.NO_ID }        
    }

    /** called by router when delete request received for for recipes resource */
    public handleDelete = async (request: IRequest): Promise<IError | any> => {
        if (this.acceptTypes.indexOf(request.headers.accept) === -1) {
            return <IError>{ error_type: ErrorTypes.BAD_MEDIA_TYPE }
        }
        
        /** confirm id in request */
        if (request.params.recipe_id) {
            const decoded = AuthenticationService.Instance.decodeJwt(
                request.headers.authorization); 
            if (decoded === undefined) { return <IError>{ error_type: ErrorTypes.UNAUTHORIZED } }
            const nameShouldBe = decoded.nickname
            
            if (nameShouldBe === undefined) { return <IError>{ error_type: ErrorTypes.UNAUTHORIZED } }
            const allUsers = await this.usersModelRef.getAllUsers();
            if (!isError(allUsers)) {
                const usersFiltered = (allUsers as IUserResult[])
                    .filter(x => x.username === nameShouldBe);
                if (usersFiltered.length) {
                    let user = usersFiltered[0];
                    const recipe = await this.recipesModel.getRecipeById(request.params.recipe_id);
                    if (isError(recipe)) return <IError>{ error_type: ErrorTypes.NOT_FOUND }
                    else {
                        if (user.id === (recipe as IRecipeResult).owner.id) {
                            /**
                             * return confirmation to route handler
                             *  
                             */
                            let deleteConfirmed
                                = await this.recipesModel.deleteRecipe(
                                    request.params.recipe_id)    
                            return deleteConfirmed;
                        }return <IError>{ error_type: ErrorTypes.FORBIDDEN }
                    }
                }
            } return <IError>{ error_type: ErrorTypes.NOT_FOUND }
        } else {
            return <IError>{ error_type: ErrorTypes.METHOD_NOT_ALLOWED }
        }
    }

    public handleDeleteUnsecure = async (request: IRequest): Promise<IError | any> => {
        if (this.acceptTypes.indexOf(request.headers.accept) === -1) {
            return <IError>{ error_type: ErrorTypes.BAD_MEDIA_TYPE }
        }
        
        /** confirm id in request */
        if (request.params.recipe_id) {
            let deleteConfirmed = await this.recipesModel.deleteRecipe(request.params.recipe_id);
            return deleteConfirmed;    
        } return <IError>{ error_type: ErrorTypes.NO_ID }
    }

    /** construct edit object to pass to model (for patching) */
    private buildEditFromRequest(_request: IRequest): object {
        const _edit = {};
        if (_request.body.style)
            Object.assign(_edit, { style: _request.body.style });
        if (_request.body.malt)
            Object.assign(_edit, { malt: _request.body.malt });
        if (_request.body.hops)
            Object.assign(_edit, { hops: _request.body.hops });
        if (_request.body.yeast)
            Object.assign(_edit, { yeast: _request.body.yeast });
        if (_request.body.fermentationTemp)
            Object.assign(_edit, { fermentationTemp: _request.body.fermentationTemp });
        if (_request.body.owner)
            Object.assign(_edit, { owner: _request.body.owner });
        return _edit;
    }
}