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
    body: Record<string, any> = {},
    notifyStatus: boolean = true
) {
    return fetch(url, {
        method: method,
        headers: {
             ...headers,
            'Content-Type': 'application/json',
        },
        body: method !== REQUEST_METHOD.GET ? JSON.stringify(body) : undefined
    })
    .then(async response => {
        const data = await response.json();
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