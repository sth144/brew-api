import { IUserPrototype } from "./users.model";
import { IStylePrototype } from "./styles.model";
import { NoSqlClient } from "@db/nosql.client";
import { Model } from "@models/model";
import { IError, ErrorTypes, isError } from "@lib/error.interface";
import { Datastore, Query } from "@google-cloud/datastore";
import { API_URL } from "@routes/urls";
import { Formats } from "@lib/formats.interface";

// TODO: create recipe model
export interface IRecipePrototype {
    id?: string
    style: IStylePrototype,
    malt: string,
    hops: string,
    yeast: string,
    fermentationTemp: number
    owner?: IUserPrototype,
    self?: string
}

export interface IRecipeResult {
    id: string
    style: IStylePrototype,
    malt: string,
    hops: string,
    yeast: string,
    fermentationTemp: number
    owner: IUserPrototype,
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

    protected nosqlClient: NoSqlClient;

    private constructor() { 
        super();        
        this.nosqlClient = NoSqlClient.Instance;

        console.log("RecipesModel initialized");
    }

    /**
     * determine if an object conforms to the IStyle interface
     */
    public confirmInterface(obj: any): boolean {
        // TODO: implement confirm interface
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
        let query: Query = this.nosqlClient.datastore.createQuery(RECIPES).limit(3);
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

        const page = {
            items: entities,
            next: next_link
        }

        return page;
    }

    public async createRecipe()
        : Promise<string | IError> {
        // TODO: implement create
        return;
    }

    public async deleteRecipe(recipeId: string): Promise<any> {
        return this.nosqlClient.datastoreDelete(RECIPES, recipeId);
        // TODO: side effect
    }

    public async editRecipe(styleId: string, editRecipe: Partial<IRecipePrototype>)
        : Promise<any | IError> {
        // TODO: implement edit
    }
}