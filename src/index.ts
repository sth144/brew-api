require("module-alias/register");
require("dotenv").config();

import { App } from "@base/app";
/**
 * entry point for boats api
 *  - ships routes are protected by Auth0 login using JWT
 */
const app = new App();
app.start();