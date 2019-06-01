/**
 * error type definitions
 */

export interface IError {
    error_type: string
}

export const ErrorTypes = {
    INTERFACE: "INTERFACE",
    NOT_UNIQUE: "NOT_UNIQUE",
    BAD_EDIT: "BAD_EDIT",
    NO_ID: "NO_ID",
    NOT_FOUND: "NOT_FOUND",
    FORBIDDEN: "FORBIDDEN",
    BAD_MEDIA_TYPE: "BAD_MEDIA_TYPE",
    METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED"
}

/**
 * helper function to determine if an object conforms to IError interface
 * @param _testObj the object in question
 */
export const isError = (_testObj: object): boolean => {
    if (_testObj == undefined || typeof _testObj == "string") return false;
    if ("error_type" in _testObj) return true;
    return false;
}