import * as Express from "express";
import { RouterWrapper } from "./router.wrapper";
import { RecipesController } from "@controllers/recipes.controller";
import { IRequest } from "@lib/request.interface";
import { isError, IError } from "@lib/error.interface";
import { AuthenticationService } from "@base/authentication/authentication.service";

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
            this.directRequest(req, res, this.recipesController.handlePost, (req, res, result) => {
                res.status(201).send(`{ "id": ${result.id} }`);
            });
        });

        this.recipesRouter.put("/:recipe_id", this.verifier, async (req: IRequest, res): Promise<void> => {
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
            this.directRequest(req, res, this.recipesController.handleDeleteUnsecure, (req, res, result) => {
                res.status(204).end();
            });
        });
    }
}