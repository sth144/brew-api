import * as Express from "express";
import { RouterWrapper } from "./router.wrapper";
import { StylesController } from "@controllers/styles.controller";
import { IRequest } from "@lib/request.interface";
import { isError, IError } from "@lib/error.interface";

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
        this.stylesController = new StylesController();
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

        this.stylesRouter.patch("/:style_id", async (req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.stylesController.handlePatch, (req, res, result) => {
                res.status(200).end();
            });
        });

        this.stylesRouter.delete("/:style_id", async (req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.stylesController.handleDelete, (req, res, result) => {
                res.status(204).end();
            });
        });
    }
}