import { WriteOnlyController } from "@controllers/controller";
import { ErrorTypes, IError } from "@lib/error.interface";
import { IRequest } from "@lib/request.interface";


export class LoginController extends WriteOnlyController {
    constructor() {
        super();
    }

    public handlePost = async (request: IRequest): Promise<any | IError> => {
        /** 
         * login route takes user name and password to retrieve jwt token
         */
        const username = request.body.username;
        const password = request.body.password;
        const options = {
            method: "POST",
            url: `https://dev-xtakj3is.auth0.com/oauth/token`, 
            headers: { "content-type": "application/json" },
            body: {
                grant_type: "password",
                username: username,
                password: password,

                connection: "Username-Password-Authentication",
                client_id: process.env.CLIENT_ID,  
                client_secret: process.env.CLIENT_SECRET,
            },
            json: true
        };
        return options;
    }
}