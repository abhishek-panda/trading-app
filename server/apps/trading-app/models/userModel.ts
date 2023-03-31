import crypto from 'crypto';
import bcrypt from 'bcrypt';
import Yup from 'yup';
import { DataSource } from 'typeorm';
import DBConn from '../../../dbConn';
import User from '../../../entities/User';
import UserSession, { SESSION_STATE } from '../../../entities/UserSession';
import { UserRegistrationInputs } from '../../../../libs/typings'
import { validUserRegistrationSchema, validTokenSchema } from '../../../../libs/utils';



export default class UserModel {

    private dbConn: DataSource;

    constructor() {
        this.dbConn = DBConn.getInstance();
    }

    async register(registrationData: UserRegistrationInputs): Promise<Record<string, any>> {
        try {
            const validUser = await validUserRegistrationSchema.validate(registrationData);
            const userRepository = this.dbConn.getRepository(User);
            const userExists = await userRepository.findOneBy({ email: validUser.email });
            if (!userExists) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(validUser.password, salt);
                const user = new User(validUser.uname, validUser.email, hashedPassword);
                const result = await userRepository.save(user);
                if (result.id) {
                    const response = {
                        message: "User registered successfully"
                    };
                    return response;
                }
                throw new Yup.ValidationError("Failed to registed", validUser.email, 'email');
            } else {
                throw new Yup.ValidationError("Email already registered", validUser.email, 'email');
            }
        } catch (error: any) {
            const errorDetails = {
                error: {
                    [error.path]: `${error.errors.join()}`
                }
            }
            return errorDetails;
        }
    };

    async getUser(authorizationHeader: string) {
        const isValidAuthorizationHeader = await validTokenSchema.isValid(authorizationHeader);
        if (authorizationHeader && isValidAuthorizationHeader) {
            const tokens = authorizationHeader.split(" ");
            const sessionId = tokens[1];
            const tempRandomId = crypto.randomBytes(20).toString('hex');
            if (sessionId && tempRandomId.length === sessionId.length) {
                const userRepository = this.dbConn.getRepository(User);
                const result = await userRepository
                    .createQueryBuilder()
                    .select(["name, email"])
                    .where((qb) => {
                        const subQuery = qb
                            .subQuery()
                            .select("session.userId")
                            .from(UserSession, "session")
                            .where("session.id = :sessionId")
                            .andWhere("session.isValid = :isValid")
                            .getQuery()
                        return `id = ${subQuery}`;
                    })
                    .setParameters({ sessionId, isValid: SESSION_STATE.VALID })
                    .getRawOne();

                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    }
}