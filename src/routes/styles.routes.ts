import * as Express from "express";
import { RouterWrapper } from "./router.wrapper";
import { StylesController } from "@controllers/styles.controller";
import { IRequest } from "@lib/request.interface";
import { isError, IError } from "@lib/error.interface";

// Entity Requirements
// TODO: Each entity must be represented by its own URL as a collection 
//      (eg. /ships represents the ships collection)
// TODO: The root collection URL for an entity must implement paging 
//      showing 5 entities at a time
// TODO: At a minimum it must have a 'next' link on every page except the 
//      last
// TODO: The collection must include a property that indicates how many 
//      total items are in the collection
// TODO: Every representation of an entity must have a 'self' link pointing 
//      to the canonical representation of that entity (full URL, not 
//      relative path)
// TODO: Each entity must have at least 3 properties, related entities are 
//      not consider a property in this count (eg. the slip that a ship is 
//      in is not a property)
// TODO: It must be possible to create, read, update and delete every entity (must 
//      handle any "side effects" similar how you had to update cargo when 
//      deleting a ship)
// TODO: Relationships creation and deletion should be handled via PUTs and 
//      DELETEs to URLs
// TODO: You only need to support JSON representations, however, you should 
//       reject any request that does not include `application/json` in the 
//      accept header

export class StylesRouterWrapper extends RouterWrapper {
    /**
     * singleton
     */
    private static _instance: StylesRouterWrapper;
    public static get Instance() {
        if (!this._instance) this._instance = new StylesRouterWrapper();
        return this._instance;
    }

    public stylesRouter: Express.Router;
    private stylesController: StylesController;

    private constructor() {
        super();
        this.stylesRouter = Express.Router();
        this.stylesController = new StylesController(["application/json"]);
        this.setupRoutes();
    }
    
    protected setupRoutes(): void {
        this.stylesRouter.get("/(:style_id)?", async (req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.stylesController.handleGet, (req, res, result) => {
                res.status(200).json(result);
            });
        });

        this.stylesRouter.post("/", async (req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.stylesController.handlePost, (req, res, result) => {
                res.status(201).send(`{ "id": ${result.id} }`);
            });
        });

        this.stylesRouter.put("/:style_id", async (req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.stylesController.handlePut, (req, res, result) => {
                res.status(200).end();
            });
        });

        this.stylesRouter.delete("/:style_id", async (req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.stylesController.handleDelete, (req, res, result) => {
                res.status(204).end();
            });
        });
    
        /**
         * unsecure (for testing)
         */
        this.stylesRouter.delete("/unsecure/:recipe_id",async (req: IRequest, res): Promise<void> => {
            console.log("unsecure delete syt")
            this.directRequest(req, res, this.stylesController.handleDelete, (req, res, result) => {
                res.status(204).end();
            });
        });
    }
}