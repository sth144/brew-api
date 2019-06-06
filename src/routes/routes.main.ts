import * as Express from "express";
import { IRequest } from "@lib/request.interface";
import { ErrorTypes, IError } from "@lib/error.interface";
import { LoginRouterWrapper } from "./login.routes";
import { UsersRouterWrapper } from "./users.routes";
import { StylesRouterWrapper } from "./styles.routes";
import { RecipesRouterWrapper } from "./recipes.routes";
import { USERS } from "@models/users.model";
import { STYLES } from "@models/styles.model";
import { RECIPES } from "@models/recipes.model";


/** instantiate the router */
export const router: Express.Router = Express.Router();

/** attach error callbacks to subrouters */
LoginRouterWrapper.Instance.attachErrorCallback(_errorHandler);
UsersRouterWrapper.Instance.attachErrorCallback(_errorHandler);

/** hook up the routers */
router.use(`/login`, LoginRouterWrapper.Instance.loginRouter);
router.use(`/${USERS}`, UsersRouterWrapper.Instance.usersRouter);
router.use(`/${STYLES}`, StylesRouterWrapper.Instance.stylesRouter);
router.use(`/${RECIPES}`, RecipesRouterWrapper.Instance.recipesRouter);

/**
 * generic error handler
 * @param err error object (conforms to IError interface)
 * @param req the request object
 * @param res response object reference
 */
async function _errorHandler(err: IError, req: IRequest, res): Promise<void> {
    switch(err.error_type) {
        case ErrorTypes.BAD_MEDIA_TYPE:
        case ErrorTypes.BAD_EDIT: {
            res.status(406).end();
        } break;
        case ErrorTypes.METHOD_NOT_ALLOWED: {
            res.status(405).end();
        } break;
        case ErrorTypes.NOT_FOUND: {
            res.status(404).end();
        } break;
        case ErrorTypes.INTERFACE: {
            res.status(400).end();
        } break;
        case ErrorTypes.NO_ID: {
            res.status(400).end();
        } break;
        case ErrorTypes.NOT_UNIQUE: {
            res.status(403).end();
        } break;
        case ErrorTypes.FORBIDDEN: {
            res.status(403).end();
        } break;
        default: ;
    }
}