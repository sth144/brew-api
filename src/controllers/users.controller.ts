import { Controller } from "@controllers/controller";
import { ErrorTypes, IError, isError } from "@lib/error.interface";
import { IRequest } from "@lib/request.interface";
import { AuthenticationService } from "@base/authentication/authentication.service";
import { UsersModel, IUserResult } from "@models/users.model";
import { AdminClient } from "@base/authentication/auth0.admin-client";



export class UsersController extends Controller {
    private usersModel: UsersModel = UsersModel.Instance;
    
    private adminClientRef: AdminClient = AdminClient.Instance;

    constructor() {
        super();
    }

    public handleGet = async (request: IRequest): Promise<any | IError> => {
        const nameShouldBe = AuthenticationService.Instance.decodeJwt(
            request.headers.authorization).name
        const allUsers = await this.usersModel.getAllUsers();
        if (!isError(allUsers)) {
            const usersFiltered = (allUsers as IUserResult[])
                .filter(x => x.id === request.body.user_id);
            if (usersFiltered.length) {
                let user = usersFiltered[0];
                if (user.username === nameShouldBe) {
                    return user;
                } return <IError>{ error_type: ErrorTypes.FORBIDDEN }
            } 
        } return <IError>{ error_type: ErrorTypes.NOT_FOUND }
    }

    public handlePut = async (request: IRequest): Promise<any | IError> => {
        const nameShouldBe = AuthenticationService.Instance.decodeJwt(
            request.headers.authorization).name
        const allUsers = await this.usersModel.getAllUsers();
        if (!isError(allUsers)) {
            const usersFiltered = (allUsers as IUserResult[])
                .filter(x => x.id === request.body.user_id);
            if (usersFiltered.length) {
                let user = usersFiltered[0];
                if (user.username === nameShouldBe) {
                    const edit = this.buildEditFromRequest(request);

                    const editConfirmed = this.usersModel.editUser(
                        request.params.user_id, edit)
                } return <IError>{ error_type: ErrorTypes.FORBIDDEN }
            } 
        } return <IError>{ error_type: ErrorTypes.NOT_FOUND }
    }

    public handlePost = async (request: IRequest): Promise<any | IError> => {
        // TODO: check username unique
        // TODO: figure this out
        const username = request.body.username;
        const password = request.body.password;
        const email = request.body.email;
        const options = {
            method: "POST",
            url: `https://dev-xtakj3is.auth0.com/dbconnections/signup`, 
            headers: { "content-type": "application/json" },
            body: {
                grant_type: "password",
                username: username,
                email: email,
                password: password,
                scope: "openid profile",
                email_verified: false, 
                verify_email: false, 
                app_metadata: {},
                connection: "Username-Password-Authentication",
                client_id: process.env.CLIENT_ID,  
                client_secret: process.env.CLIENT_SECRET
            },
            json: true
        };
        return options;
    }

    public postDatastore = async(request: IRequest, auth0id: string) => {
        let user = await this.usersModel.createUser(request.body.username, auth0id);
        return user;
    }

    public handleDelete = async (request: IRequest): Promise<any | IError> => {
        if (request.body.user_id) {
            const usr = await this.usersModel.getUserById(request.body.user_id);
            await this.usersModel.deleteUser(request.body.user_id);
            const authId = (usr as IUserResult).auth0id;
            //this.adminClientRef.deleteUser(authId);
        } else {
            /** 
             * this is unsecure, and would be removed in a production app
             *  - allows any user to delete all users (used for development)
             */
            const allUsers = await this.usersModel.getAllUsers() as IUserResult[];
            if (!isError(allUsers)) {
                for (let user of allUsers) {
                    const authId = user.auth0id;
                    await this.usersModel.deleteUser(user.id);

                    // TODO: delete from Auth0?
                    //this.adminClientRef.deleteUser(authId);
                }
            }
        }
    }


    /** construct edit object to pass to model (for patching) */
    private buildEditFromRequest(_request: IRequest): object {
        const _edit = {};
        if (_request.body.username)
            Object.assign(_edit, { username: _request.body.username });
        if (_request.body.password)
            Object.assign(_edit, { password: _request.body.password });
        return _edit;
    }
}