import * as Express from "express";
import { RouterWrapper } from "@routes/router.wrapper";
import { IRequest } from "@lib/request.interface";
import { LoginController } from "@controllers/login.controller";
import * as request from "request";
import { AuthenticationService } from "@base/authentication/authentication.service";

export class LoginRouterWrapper extends RouterWrapper {
    private static _instance: LoginRouterWrapper;
    public static get Instance() {
        if (!this._instance) this._instance = new LoginRouterWrapper();
        return this._instance;
    }

    public loginRouter: Express.Router = Express.Router();
    private loginController: LoginController = new LoginController();
    private verifier = AuthenticationService.Instance.JwtVerifier;

    private constructor() { 
        super();
        this.setupRoutes();
    }

    protected setupRoutes(): void {
        this.loginRouter.post("/", async(req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.loginController.handlePost, (req, res, postOptions) => {
                request.post(postOptions, (error, response, body) => {
                    if (error) {
                        res.status(500).send(error);
                    } else {
                        /** send JWT back */
                        res.send(body)
                    }
                });
            });
        });   
    }


}