const ManagementClient = require("auth0").ManagementClient;
const AuthenticationClient = require("auth0").AuthenticationClient;

export class AdminClient {
    private static _instance: AdminClient;
    public static get Instance(): AdminClient {
        if (!this._instance) this._instance = new AdminClient();
        return this._instance;
    }
    private mgmtClient: any;
    private authClient: any;

    private constructor() { 
        // console.log(process.env.CLIENT_ID)
        // this.mgmtClient = new ManagementClient({
        //     domain: 'dev-xtakj3is.auth0.com',
        //     clientId: process.env.CLIENT_ID,
        //     clientSecret: process.env.CLIENT_SECRET,
        //     scope: 'read:users update:users'
        // });

        // this.authClient = new AuthenticationClient({
        //     domain: 'dev-xtakj3is.auth0.com',
        //     clientId: process.env.CLIENT_ID,
        //     clientSecret: process.env.CLIENT_SECRET,
        // });

        // this.authClient.clientCredentialsGrant({
        //         audience: 'https://dev-xtakj3is.auth0.com/api/v2/',
        //         scope: 'read:users update:users'
        //     }, (err, response) => {
        //         if (err) {
        //             // Handle error.
        //             console.log(err);
        //         }
        //     });
    }

    public deleteUser(userId) {
		this.mgmtClient.users.delete({id: userId}, (err) => {
			if (err) {
				console.log(err);
			}
		});
	}
}