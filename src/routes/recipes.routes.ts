import * as Express from "express";
import { RouterWrapper } from "./router.wrapper";
import { RecipesController } from "@controllers/recipes.controller";
import { IRequest } from "@lib/request.interface";
import { isError, IError } from "@lib/error.interface";

export class RecipesRouterWrapper extends RouterWrapper {
    /**
     * singleton
     */
    private static _instance: RecipesRouterWrapper;
    public static get Instance() {
        if (!this._instance) this._instance = new RecipesRouterWrapper();
        return this._instance;
    }

    public recipesRouter: Express.Router;
    private recipesController: RecipesController;

    private constructor() {
        super();
        this.recipesRouter = Express.Router();
        this.recipesController = new RecipesController();
        this.setupRoutes();
    }
    
    protected setupRoutes(): void {
        this.recipesRouter.get("/(:recipe_id)?", async (req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.recipesController.handleGet, (req, res, result) => {
                res.status(200).json(result);
            });
        });

        this.recipesRouter.post("/", async (req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.recipesController.handlePost, (req, res, result) => {
                res.status(201).send(`{ "id": ${result.id} }`);
            });
        });

        this.recipesRouter.patch("/:recipe_id", async (req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.recipesController.handlePatch, (req, res, result) => {
                res.status(200).end();
            });
        });

        this.recipesRouter.delete("/:recipe_id", async (req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.recipesController.handleDelete, (req, res, result) => {
                res.status(204).end();
            });
        });
    }
}