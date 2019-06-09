import * as Express from "express";
import { RouterWrapper } from "@routes/router.wrapper";
import { IRequest } from "@lib/request.interface";
import { LoginController } from "@controllers/login.controller";
import * as request from "request";
import { AuthenticationService } from "@base/authentication/authentication.service";
import { UsersModel, IUserResult } from "@models/users.model";

export class LoginRouterWrapper extends RouterWrapper {
    private static _instance: LoginRouterWrapper;
    public static get Instance() {
        if (!this._instance) this._instance = new LoginRouterWrapper();
        return this._instance;
    }

    public loginRouter: Express.Router = Express.Router();
    private loginController: LoginController = new LoginController(["application/json"]);
    private verifier = AuthenticationService.Instance.JwtVerifier;

    private usersModelRef: UsersModel = UsersModel.Instance;

    private constructor() { 
        super();
        this.setupRoutes();
    }

    protected setupRoutes(): void {
        this.loginRouter.post("/", async(req: IRequest, res): Promise<void> => {
            this.directRequest(req, res, this.loginController.handlePost, (req, res, postOptions) => {
                request.post(postOptions, async (error, response, body) => {
                    if (error) {
                        res.status(500).send(error);
                    } else {
                        const allUsers = await this.usersModelRef.getAllUsers();
                        for (let user of allUsers as IUserResult[]) {
                            const decoded = AuthenticationService.Instance
                                .decodeJwt(body.id_token);
                            if (user.username === decoded.nickname) {
                                Object.assign(body, { user_id: user.id });
                            }
                        }

                        /** send JWT back */
                        res.status(201).send(JSON.stringify(body));
                    }
                });
            });
        });   
    }
}