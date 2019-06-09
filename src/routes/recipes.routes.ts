import * as Express from "express";
import { RouterWrapper } from "./router.wrapper";
import { RecipesController } from "@controllers/recipes.controller";
import { IRequest } from "@lib/request.interface";
import { isError, IError } from "@lib/error.interface";
import { AuthenticationService } from "@base/authentication/authentication.service";

// Entity Requirements
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

export class RecipesRouterWrapper extends RouterWrapper {
    /**
     * singleton
     */
    private static _instance: RecipesRouterWrapper;
    public static get Instance() {
        if (!this._instance) this._instance = new RecipesRouterWrapper();
        return this._instance;
    }

    private verifier = AuthenticationService.Instance.JwtVerifier;

    public recipesRouter: Express.Router;
    private recipesController: RecipesController;

    private constructor() {
        super();
        this.recipesRouter = Express.Router();
        this.recipesController = new RecipesController(["application/json"]);
        this.setupRoutes();
    }
    
    protected setupRoutes(): void {
        this.recipesRouter.get("/(:recipe_id)?", this.verifier, async (req:   IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.recipesController.handleGet, (req, res, result) => {
                res.status(200).json(result);
            });
        });

        this.recipesRouter.post("/", this.verifier, async (req: IRequest, res): Promise<void> => {
            console.log("post")
            this.directRequest(req, res, this.recipesController.handlePost, (req, res, result) => {
                console.log("gonna send");
                res.status(201).send(`{ "id": ${result.id} }`);
                console.log("sent");
            }).catch(() => { console.log("caught"); });
        });

        this.recipesRouter.put("/:recipe_id", this.verifier, async (req: IRequest, res): Promise<void> => {
            console.log("put");
            this.directRequest(req, res, this.recipesController.handlePut, (req, res, result) => {
                res.status(200).end();
            });
        });

        this.recipesRouter.delete("/:recipe_id", this.verifier, async (req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.recipesController.handleDelete, (req, res, result) => {
                res.status(204).end();
            });
        });

        /**
         * unsecure (for testing)
         */
        this.recipesRouter.delete("/unsecure/:recipe_id",async (req: IRequest, res): Promise<void> => {
            console.log("unsecure delete");
            this.directRequest(req, res, this.recipesController.handleDeleteUnsecure, (req, res, result) => {
                res.status(204).end();
            });
        });
    }
}