import { NoSqlClient } from "@db/nosql.client";
import { Model } from "@models/model";
import { IError, ErrorTypes, isError } from "@lib/error.interface";
import { Datastore, Query } from "@google-cloud/datastore";
import { API_URL } from "@routes/urls";
import { Formats } from "@lib/formats.interface";

export interface IStylePrototype {
    id?: string,
    name: string,
    category: string,
    ibu: number,
    abv: number,
    self?: string 
}

export interface IStyleResult {
    id: string,
    name: string,
    category: string,
    ibu: number,
    abv: number,
    self: string 
}

export interface IStylesPaginated {
    styles: IStyleResult[],
    next: string
}

export const STYLES = "styles";
export const STYLES_CURSORS = "styles_cursors";

export class StylesModel extends Model {
    /**
     * singleton
     */
    private static _instance: StylesModel;
    public static get Instance(): StylesModel {
        if (!this._instance) this._instance = new StylesModel();
        return this._instance;
    }

    protected nosqlClient: NoSqlClient = NoSqlClient.Instance;

    private constructor() { 
        super();        

        console.log("StylesModel initialized");
    }

    /** check that name supplied in request is unique */
    public async nameUnique(_testName: string): Promise<boolean> {
        /** get all names */
        let allStyles = await this.getAllStyles() as IStyleResult[];
        if (!isError(allStyles)) {
            /** check against each name */
            for (let style of allStyles) 
                if (_testName == style.name) 
                    return false;
        }
        /** name is unique */
        return true;
    }

    /**
     * determine if an object conforms to the IStyle interface
     */
    public confirmInterface(obj: any): boolean {
        if (   !("name" in obj) || !("category" in obj) || !("ibu" in obj)
            || !("abv" in obj) 
            || !(typeof obj.name === "string")
            || !(typeof obj.category === "string")
            || !(typeof obj.ibu === "number")
            || !(typeof obj.abv === "number")) return false;
        return true;
    }

        /** 
     * confirm that style with id exists 
     */
    public async styleExistsById(_id: string): Promise<boolean> {
        let result = await this.getStyleById(_id) as IStyleResult;
        if (isError(result)) return false;
        return true;
    }


    /**
     * retrieve a style object by its datastore id
     */
    public async getStyleById(styleId: string, format: string = Formats.JSON)
        : Promise<IStyleResult | string | IError> {
        let style = await this.nosqlClient.datastoreGetById(STYLES, styleId);
        if (style == undefined) return <IError>{ error_type: ErrorTypes.NOT_FOUND }

        switch (format) {
            default: case Formats.JSON: {
                return style;
            } break;
        }
    }

    /**
     * retrieve entire collection (all styles)
     */
    public async getAllStyles(): Promise<IStyleResult[] | IError> {
        let allStyles = await this.nosqlClient.datastoreGetCollection(STYLES);
        if (allStyles == undefined) return <IError>{ error_type: ErrorTypes.NOT_FOUND }
        return allStyles;
    }

    public async getAllStylesPaginated(_cursor?): Promise<any> {
        let query: Query = this.nosqlClient.datastore.createQuery(STYLES).limit(5);
        if (_cursor !== undefined) {
            query = query.start(_cursor);
        }

        const results = await this.nosqlClient.runQueryForModel(query);
        const entities = results[0];
        const info = results[1];
        const next_cursor = results[1].endCursor;
        let next_link = null;

        if (info.moreResults !== this.nosqlClient.datastore.NO_MORE_RESULTS) {
            next_link = `${API_URL}/styles?cursor=${next_cursor}`;
        }

        const page = {
            items: entities,
            next: next_link
        }

        return page;
    }

    public async createStyle(
        _name: string, _category: string, _ibu: number, _abv: number)
        : Promise<string | IError> {
        const newData: IStylePrototype = {
            name: _name,
            category: _category,
            ibu: _ibu,
            abv: _abv
        }    
        const newKey = await this.nosqlClient.datastoreSave(STYLES, newData);

        Object.assign(newData, { id: `${newKey.id}` });
        Object.assign(newData, { self: `${API_URL}/${STYLES}/${newKey.id}` });
        
        const newStyle = {
            key: newKey,
            data: newData
        }

        await this.nosqlClient.datastoreUpsert(newStyle);

        return newKey;
    }

    public async deleteStyle(styleId: string): Promise<any> {
        return this.nosqlClient.datastoreDelete(STYLES, styleId)
            .then(async () => {
                for (let deleteCallback of this.deleteCallbacks)
                    await deleteCallback(styleId);
            })
    }

    public async editStyle(styleId: string, editStyle: Partial<IStylePrototype>)
        : Promise<any | IError> {
        if (await this.styleExistsById(styleId)) {
            let edited = await this.nosqlClient.datastoreEdit(STYLES, styleId, editStyle);
            return edited;
        } else return <IError>{ error_type: ErrorTypes.NOT_FOUND }    
    }
}