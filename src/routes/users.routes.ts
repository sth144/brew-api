import * as Express from "express";
import { RouterWrapper } from "@routes/router.wrapper";
import { UsersController } from "@controllers/users.controller";
import { AuthenticationService } from "@base/authentication/authentication.service";

export class UsersRouterWrapper extends RouterWrapper {
    private static _instance: UsersRouterWrapper;
    public static get Instance(): UsersRouterWrapper {
        if (!this._instance) this._instance = new UsersRouterWrapper();
        return this._instance;
    }

    public usersRouter: Express.Router = Express.Router();
    private usersController: UsersController = new UsersController();
    private verifier = AuthenticationService.Instance.JwtVerifier;

    private constructor() {
        super();
        this.setupRoutes();
    }

    protected setupRoutes(): void {
        this.usersRouter.get("/:user_id/ships", this.verifier, async (req, res) => {
            this.directRequest(req, res, this.usersController.handleGet, (req, res, result) => {
                res.status(200).send(result);
            })
        });
    }
}