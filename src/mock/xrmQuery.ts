import * as FS from "fs";
import * as Path from "path";

let retrieveHandler: SendRequest;
let retrieveHandlers = [] as SendRequest[];
let retrieveMultipleHandler: SendRequest;
let retrieveMultipleHandlers = [] as SendRequest[];

export type SendRequest = (
    type: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    queryString: string,
    data: any,
    successCb: (x: { response: string }) => any,
    errorCb?: (err: Error) => any,
    configure?: (req: XMLHttpRequest) => void,
    sync?: boolean,
) => void;

function loadXrmQueryMock(): void {
    if (typeof XrmQuery !== "undefined") {
        return;
    }

    const js = FS.readFileSync(Path.resolve(__dirname, "../lib/dg.xrmquery.web.js")).toString();
    eval.call({}, js);

    XrmQuery.sendRequest = jest.fn((_type, _queryString, _data, successCb, errorCb, configure, sync) => {
        if (isRetrieveRequest(_queryString)) {
            if (retrieveHandler) {
                retrieveHandler(_type, _queryString, _data, successCb as any, errorCb, configure, sync);
            } else if (retrieveHandlers?.length === 0) {
                const error = `Retrieve Request for ${_queryString} did not have a response defined!`;
                console.error(error);
                throw new Error(error);
            } else {
                const handler = retrieveHandlers.shift() as SendRequest;
                handler(_type, _queryString, _data, successCb as any, errorCb, configure, sync);
            }
        } else {
            // TODO: check for retireve Multiple
            if (retrieveMultipleHandler) {
                retrieveMultipleHandler(_type, _queryString, _data, successCb as any, errorCb, configure, sync);
            } else if (retrieveMultipleHandlers?.length === 0) {
                const error = `RetrieveMultiple Request for ${_queryString} did not have a response defined!`;
                console.error(error);
                throw new Error(error);
            } else {
                const handler = retrieveMultipleHandlers.shift() as SendRequest;
                handler(_type, _queryString, _data, successCb as any, errorCb, configure, sync);
            }
        }
    });
}

export function retrieve(responseOrHandler: Record<string, unknown> | SendRequest, timeout = 1): Promise<void> {
    loadXrmQueryMock();
    let resolver: () => void;
    const promise = new Promise<void>((resolve) => {
        resolver = resolve;
    });
    if (typeof responseOrHandler === "function") {
        const handler = responseOrHandler;
        responseOrHandler = (
            type: XQW.HttpRequestType,
            queryString: string,
            data: any,
            successCb: (x: XMLHttpRequest) => any,
            errorCb?: (err: Error) => any,
            configure?: (req: XMLHttpRequest) => void,
            sync?: boolean,
        ) => {
            handler(
                type,
                queryString,
                data,
                (r: { response: string }) => {
                    const result = successCb(r as XMLHttpRequest);
                    setTimeout(() => {
                        resolver();
                    }, timeout);
                    return result;
                },
                errorCb,
                configure,
                sync,
            );
        };
    } else {
        const response = responseOrHandler;
        responseOrHandler = jest.fn((_type, _queryString, _data, successCb) => {
            successCb({ response: JSON.stringify(response) } as XMLHttpRequest);
            setTimeout(() => {
                resolver();
            }, timeout);
        }) as SendRequest;
    }
    retrieveHandler = responseOrHandler as any;

    return promise;
}

export function retrieveResponses(responses: Record<string, unknown>[]): void {
    loadXrmQueryMock();
    retrieveHandlers = responses.map(
        (r) => (_type: XQW.HttpRequestType, _qs: string, _data: any, successCb: (arg0: any) => void) => {
            successCb({ response: JSON.stringify(r) } as XMLHttpRequest);
        },
    );
}

export function retrieveMultiple(
    responseOrHandler: Record<string, unknown>[] | SendRequest,
    timeout = 1,
): Promise<void> {
    loadXrmQueryMock();
    let resolver: () => void;
    const promise = new Promise<void>((resolve) => {
        resolver = resolve;
    });
    if (typeof responseOrHandler === "function") {
        const handler = responseOrHandler;
        responseOrHandler = (
            type: XQW.HttpRequestType,
            queryString: string,
            data: any,
            successCb: (x: XMLHttpRequest) => any,
            errorCb?: (err: Error) => any,
            configure?: (req: XMLHttpRequest) => void,
            sync?: boolean,
        ) => {
            handler(
                type,
                queryString,
                data,
                (r: { response: string }) => {
                    const result = successCb(r as XMLHttpRequest);
                    setTimeout(() => {
                        resolver();
                    }, timeout);
                    return result;
                },
                errorCb,
                configure,
                sync,
            );
        };
    } else {
        const response = responseOrHandler;
        responseOrHandler = jest.fn((_type, _queryString, _data, successCb) => {
            successCb({ response: JSON.stringify({ value: response }) } as XMLHttpRequest);
            setTimeout(() => {
                resolver();
            }, timeout);
        }) as SendRequest;
    }
    retrieveMultipleHandler = responseOrHandler as any;

    return promise;
}

export function retrieveMultipleResponses(responses: Record<string, unknown>[][]): void {
    loadXrmQueryMock();
    retrieveMultipleHandlers = responses.map(
        (r) => (_type: XQW.HttpRequestType, _qs: string, _data: any, successCb: (arg0: any) => void) => {
            successCb({ response: JSON.stringify({ value: r }) } as XMLHttpRequest);
        },
    );
}

function isRetrieveRequest(queryString: string): boolean {
    return queryString.split(")?")?.length === 2;
}
