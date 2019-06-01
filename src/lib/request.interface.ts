/**
 * HTTP request interface
 */
export interface IRequest {
    params: any,
    query: any,
    body: any,
    path: any,
    headers: any
}