/**
 * set API url dynamically
 */
let _URL = "http://localhost:8080";
if (process.env.GOOGLE_CLOUD_PROJECT == "hindss-final") {
    _URL = "https://hindss-final.appspot.com"
}
export const API_URL = _URL;