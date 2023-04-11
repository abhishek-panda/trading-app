import { IResponse } from "../../../../libs/typings";

export default class BaseController {

    protected async getStatusAndResponse (callback : () => Promise<IResponse> | undefined): Promise<[number, IResponse]> {
        let status: number, result: IResponse;
        let data = await callback();
        if (data) {
            status = data.error ? 401 : 200;
            result = data;
        } else {
            status = 401;
            result = {
                error: {
                    user: "Unauthorized"
                }
            };
        }
        return [status, result];
    }

}