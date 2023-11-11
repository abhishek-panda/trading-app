import showToast, { ToastType } from './toast';

export enum REQUEST_METHOD {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = "DELETE"
}

function request(
    url: string,
    method: REQUEST_METHOD = REQUEST_METHOD.GET,
    headers: Record<string, string> = {},
    body: Record<string, any> | FormData = {},
    notifyStatus: boolean = true,
) {
    let contentType = {};
    if (!(body instanceof FormData)) {
        contentType = {
            'Content-Type': 'application/json'
        };
    }
    return fetch(url, {
        method: method,
        headers: {
             ...headers,
            ...contentType,
        },
        body: method !== REQUEST_METHOD.GET ? (body instanceof FormData) ? body : JSON.stringify(body) : undefined
    })
    .then(async response => {
        /**
         * Failed to execute 'json' on 'Response': body stream already read
         * To avoid this error Cloned the response object.
         */
        const clonedResponse = response.clone()
        const data = await clonedResponse.json();
        if (!response.ok) {
            const errorMessage = Object.keys(data.error).reduce((accumulator, key) => {
                return accumulator += data.error[key]
            }, '');
            if (notifyStatus && errorMessage) {
                showToast(ToastType.ERROR, errorMessage);
            }
            throw new Error(errorMessage);
        }
        if (notifyStatus && data.message) {
            showToast(ToastType.SUCCESS, data.message);
        }
        return response;
    })
}

export default request;