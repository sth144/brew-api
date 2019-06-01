/**
 * set API url dynamically
 */
let _URL = "http://localhost:8080";
if (process.env.GOOGLE_CLOUD_PROJECT == "hindss-assign4") {
    _URL = "https://hindss-assign4.appspot.com"
}
export const API_URL = _URL;