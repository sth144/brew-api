import { ReadOnlyController } from "@controllers/controller";
import { ErrorTypes, IError } from "@lib/error.interface";
import { IRequest } from "@lib/request.interface";
import { AuthenticationService } from "@base/authentication/authentication.service";


export class UsersController extends ReadOnlyController {
    constructor() {
        super();
    }

    public handleGet = async (request: IRequest): Promise<any | IError> => {
        const nameShouldBe = AuthenticationService.Instance.decodeJwt(
            request.headers.authorization).name
        if (request.params.user_id == nameShouldBe) {
            // TODO:
        } return <IError>{ error_type: ErrorTypes.FORBIDDEN }
    }
}