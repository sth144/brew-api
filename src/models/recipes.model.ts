import { IUserPrototype, UsersModel, IUserResult } from "./users.model";
import { IStylePrototype, StylesModel, IStyleResult } from "./styles.model";
import { NoSqlClient } from "@db/nosql.client";
import { Model } from "@models/model";
import { IError, ErrorTypes, isError } from "@lib/error.interface";
import { Datastore, Query } from "@google-cloud/datastore";
import { API_URL } from "@routes/urls";
import { Formats } from "@lib/formats.interface";

export interface IRecipePrototype {
    style: string

    id?: string
    malt: string,
    hops: string,
    yeast: string,
    self?: string        /** self link  */
}

export interface IRecipeResult {
    id: string,
    style: {
        id: string,
        self: string
    },
    malt: string,
    hops: string,
    yeast: string,
    owner: {
        id: string,
        self: string
    },
    self: string
}

export interface IRecipesPaginated {
    recipes: IRecipeResult[],
    next: string
}

export const RECIPES = "recipes";
export const RECIPES_CURSORS = "recipes_cursors";

export class RecipesModel extends Model {
    /**
     * singleton
     */
    private static _instance: RecipesModel;
    public static get Instance(): RecipesModel {
        if (!this._instance) this._instance = new RecipesModel();
        return this._instance;
    }

    protected nosqlClient: NoSqlClient = NoSqlClient.Instance;
    private stylesModelRef: StylesModel = StylesModel.Instance;
    private usersModelRef: UsersModel = UsersModel.Instance;

    private constructor() { 
        super();        

        this.stylesModelRef.registerDeleteCallback(this.handleStyleDeleted);
        this.usersModelRef.registerDeleteCallback(this.handleUserDeleted);
        console.log("RecipesModel initialized");
    }

    /**
     * determine if an object conforms to the IStyle interface
     */
    public confirmInterface(obj: any): boolean {
        if (   !("style" in obj) || !("malt" in obj) || !("hops" in obj)
            || !("yeast" in obj)
            || !(typeof obj.style === "string")
            || !(typeof obj.malt === "string")
            || !(typeof obj.hops === "string")
            || !(typeof obj.yeast === "string")) return false;
        return true;
    }

        /** 
     * confirm that style with id exists 
     */
    public async recipeExistsById(_id: string): Promise<boolean> {
        let result = await this.getRecipeById(_id) as IRecipeResult;
        if (isError(result)) return false;
        return true;
    }


    /**
     * retrieve a style object by its datastore id
     */
    public async getRecipeById(styleId: string, format: string = Formats.JSON)
        : Promise<IRecipeResult | string | IError> {
        let style = await this.nosqlClient.datastoreGetById(RECIPES, styleId);
        if (style == undefined) return <IError>{ error_type: ErrorTypes.NOT_FOUND }

        switch (format) {
            default: case Formats.JSON: {
                return style;
            } break;
        }
    }

    /**
     * retrieve entire collection (all recipes)
     */
    public async getAllRecipes(): Promise<IRecipeResult[] | IError> {
        let allRecipes = await this.nosqlClient.datastoreGetCollection(RECIPES);
        if (allRecipes == undefined) return <IError>{ error_type: ErrorTypes.NOT_FOUND }
        return allRecipes;
    }

    public async getAllRecipesPaginated(_cursor?): Promise<any> {
        let query: Query = this.nosqlClient.datastore.createQuery(RECIPES).limit(5);
        if (_cursor !== undefined) {
            query = query.start(_cursor);
        }

        const results = await this.nosqlClient.runQueryForModel(query);
        const entities = results[0];
        const info = results[1];
        const next_cursor = results[1].endCursor;
        let next_link = null;

        if (info.moreResults !== this.nosqlClient.datastore.NO_MORE_RESULTS) {
            next_link = `${API_URL}/recipes?cursor=${next_cursor}`;
        }

        /** get total count */
        const all = await this.getAllRecipes();
        const totalCount = (all as IRecipeResult[]).length;

        const page = {
            collectionSize: totalCount,
            items: entities,
            next: next_link
        }

        return page;
    }

    public async getRecipesForUser(userName: string): Promise<IRecipeResult[] | IError> {
        let query: Query = this.nosqlClient.datastore.createQuery(RECIPES)
            .filter("owner", "=", userName);
        const results = await this.nosqlClient.runQueryForModel(query);
        const entities = results[0];
        return entities;
    }

    public async getRecipesForStyle(styleName: string) {
        let query: Query = this.nosqlClient.datastore.createQuery(RECIPES)
            .filter("style", "=", styleName);
        const results = await this.nosqlClient.runQueryForModel(query);
        const entities = results[0];
        return entities;
    }

    public async createRecipe(
        _styleName: string, _malt: string, _hops: string, _yeast: string,
        _ownerName: string)
        : Promise<string | IError> {
        const newData: Partial<IRecipePrototype> = {
            malt: _malt,
            hops: _hops,
            yeast: _yeast
        }
        
        const allStyles = await this.stylesModelRef.getAllStyles();

        if (isError(allStyles)) return <IError>{ error_type: ErrorTypes.NOT_FOUND }
        let allUsers = await this.usersModelRef.getAllUsers();
        if (isError(allUsers)) return <IError>{ error_type: ErrorTypes.NOT_FOUND }

        let newKey = await this.nosqlClient.datastoreSave(RECIPES, newData);

        Object.assign(newData, { id: `${newKey.id}` });
        Object.assign(newData, { self: `${API_URL}/${RECIPES}/${newKey.id}` });

        const locatedStyles = (allStyles as IStyleResult[]).filter(x => x.name === _styleName)
        const styleRef = {
            id: null,
            self: null
        }

        if (locatedStyles.length !== 0) { /** should always be length 1 if found */
            styleRef.id = locatedStyles[0].id,
            styleRef.self = locatedStyles[0].self
        } else {
            /** handle case where style does not yet exist */
            this.stylesModelRef.createStyle(_styleName, null, null, null);
        }
        Object.assign(newData, { style: styleRef });
        

        const locatedUsers = (allUsers as IUserResult[]).filter(x => x.username === _ownerName);
        const ownerRef = {
            id: null,
            self: null
        }
        if (locatedUsers.length !== 0) { /** should always be length 1 if found */
            ownerRef.id = locatedUsers[0].id,
            ownerRef.self = locatedUsers[0].self
        }
        Object.assign(newData, { owner: ownerRef });

        await this.usersModelRef.addRecipeToUser(ownerRef.id, {
            id: newData.id,
            self: newData.self
        });

        const newRecipe = {
            key: newKey,
            data: newData
        }

        await this.nosqlClient.datastoreUpsert(newRecipe);

        return newKey;
    }

    public async deleteRecipe(recipeId: string): Promise<any> {
        return this.nosqlClient.datastoreDelete(RECIPES, recipeId);
    }

    private handleStyleDeleted = async (styleId: string): Promise<any> => {
        const allRecipes = await this.getAllRecipes() as IRecipeResult[];
        if (!isError(allRecipes)) {
            for (let recipe of allRecipes) {
                if (recipe.style.id === styleId) {
                    await this.editRecipe(recipe.id, {
                        style: {
                            id: null,
                            self: null
                        }
                    });
                    let rec = await this.getRecipeById(recipe.id);
                    return;
                }
            }
        }
    }

    /**
     * 
     */
    private handleUserDeleted = async (userId: string): Promise<any> => {
        const allRecipes = await this.getAllRecipes() as IRecipeResult[];
        if (!isError(allRecipes)) {
            for (let recipe of allRecipes) {
                if (recipe.owner.id === userId) {
                    await this.deleteRecipe(recipe.id);
                }
            }
        }
    }

    public async editRecipe(recipeId: string, editRecipe: Partial<IRecipeResult>)
        : Promise<any | IError> {
        if (await this.recipeExistsById(recipeId)) {
            let edited = await this.nosqlClient.datastoreEdit(RECIPES, recipeId, editRecipe);
            return edited;
        } else return <IError>{ error_type: ErrorTypes.NOT_FOUND }
    }
}