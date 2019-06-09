import * as Express from "express";
import { RouterWrapper } from "@routes/router.wrapper";
import { UsersController } from "@controllers/users.controller";
import { AuthenticationService } from "@base/authentication/authentication.service";
import * as request from "request";

export class UsersRouterWrapper extends RouterWrapper {
    private static _instance: UsersRouterWrapper;
    public static get Instance(): UsersRouterWrapper {
        if (!this._instance) this._instance = new UsersRouterWrapper();
        return this._instance;
    }

    public usersRouter: Express.Router = Express.Router();
    private usersController: UsersController = new UsersController(["application/json"]);
    private verifier = AuthenticationService.Instance.JwtVerifier;

    private constructor() {
        super();
        this.setupRoutes();
    }

    protected setupRoutes(): void {
        this.usersRouter.get("/:user_id", this.verifier, async (req, res) => {
            this.directRequest(req, res, this.usersController.handleGet, (req, res, result) => {
                res.status(200).send(result);
            });
        });


        this.usersRouter.post("/", async (req, res) => {
            this.directRequest(req, res, this.usersController.handlePost, (req, res, postOptions) => {
                request.post(postOptions, (error, response, body) => {
                    if (error) {
                        res.status(500).send(error);
                    } else {
                        // insert user in datastore
                        this.usersController.postDatastore(req, body._id)
                            .then(result => {
                                res.status(201).send(result);
                            })
                    }
                });
            })
        });

        this.usersRouter.delete("/(:user_id)?", this.verifier, async (req, res) => {
            this.directRequest(req, res, this.usersController.handleDelete, (req, res, result) => {
                /** 
                 * note: this route allows any authenticated user to delete all users
                 *  - useful for development 
                 *  - would be modified/removed in production
                 */
                res.status(204).end();
            });
        })

        this.usersRouter.delete("/unsecure/:user_id", async (req, res) => {
            /** 
             * note: this route is insecure
             *  - would be modified/removed in production
             */  
            this.directRequest(req, res, this.usersController.handleDeleteUnsecure, (req, res, result) => {
                res.status(204).end();
            });
        })
    }
}