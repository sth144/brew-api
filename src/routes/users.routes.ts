import * as Express from "express";
import { RouterWrapper } from "@routes/router.wrapper";
import { UsersController } from "@controllers/users.controller";
import { AuthenticationService } from "@base/authentication/authentication.service";
import * as request from "request";

// User Accounts
// TODO: You are allowed to use a `/login` URL where a user can provide a 
//      username and password even though this is not RESTful
// TODO: You may choose from the following methods of handling user accounts
//      You can handle all account creation and authentication yourself
//      You can use OpenID Connect or some other 3rd party authentication service
// TODO: Requests beyond the initial login should use a JWT for authentication
// TODO: User entities should only be able to be operated on by the user 
//      (eg. Alice should only be able to view and edit herself, Bob cannot 
//      view the Alice user and Alice cannot view the Bob user)
// TODO: One of the non-user entities must be a thing which is owned by a 
//      user and is only editable by the user which created it. For example, 
//      in a to-do list tracker a user might be the owner of a particular 
//      to-do list. Only they can edit the list. (Others might still be 
//      able to view it)

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
        this.usersRouter.get("/:user_id", this.verifier, async (req, res) => {
            this.directRequest(req, res, this.usersController.handleGet, (req, res, result) => {
                res.status(200).send(result);
            })
        });


        // TODO: You must support the ability for clients to create user accounts
        this.usersRouter.post("/", async (req, res) => {
            this.directRequest(req, res, this.usersController.handlePost, (req, res, postOptions) => {
                request.post(postOptions, (error, response, body) => {
                    if (error) {
                        res.status(500).send(error);
                    } else {
                        // insert user in datastore
                        this.usersController.postDatastore(req, body._id)
                            .then(result => {
                                res.send(result);
                            })
                    }
                });
            })
        });

        this.usersRouter.delete("/", this.verifier, async (req, res) => {
            this.directRequest(req, res, this.usersController.handleDelete, (req, res, result) => {
                /** 
                 * note: this route allows any authenticated user to delete all users
                 *  - useful for development
                 *  - would be modified/removed in production
                 */
                res.status(204).send(result);
            });
        })
    }
}