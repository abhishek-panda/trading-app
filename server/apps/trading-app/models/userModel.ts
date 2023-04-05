import crypto from 'crypto';
import bcrypt from 'bcrypt';
import * as Yup from 'yup';
import { DataSource } from 'typeorm';
import DBConn from '../../../dbConn';
import User from '../../../entities/User';
import UserSession from '../../../entities/UserSession';
import { UserRegistrationInputs, UserLoginInputs, IResponse } from '../../../../libs/typings'
import { validUserRegistrationSchema, validUserLoginSchema } from '../../../../libs/utils';
import { getLocalDateTime } from '../../../utils';

export default class UserModel {

    private static hashLength = 50;
    private dataSource: DataSource;


    constructor() {
        this.dataSource = DBConn.getInstance();
    }

    async register(registrationData: UserRegistrationInputs): Promise<IResponse> {
        try {
            const validUser = await validUserRegistrationSchema.validate(registrationData);
            const userRepository = this.dataSource.getRepository(User);
            const userExists = await userRepository.findOneBy({ email: validUser.email });
            if (!userExists) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(validUser.password, salt);
                const user = new User(validUser.uname, validUser.email, hashedPassword, getLocalDateTime());
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

    async getUser(authorizationHeader: string | undefined): Promise<IResponse> {
        if (authorizationHeader) {
            const sessionId = authorizationHeader;
            const tempRandomId = crypto.randomBytes(UserModel.hashLength).toString('hex');
            if (sessionId && tempRandomId.length === sessionId.length) {
                const userRepository = this.dataSource.getRepository(User);
                const result = await userRepository
                    .createQueryBuilder()
                    .select(["id", "name", "email"])
                    .where((qb) => {
                        const subQuery = qb
                            .subQuery()
                            .select("session.userId")
                            .from(UserSession, "session")
                            .where("session.id = :sessionId")
                            .andWhere("session.expiredOn > :currentTime")
                            .getQuery()
                        return `id = ${subQuery}`;
                    })
                    .setParameters({ sessionId, currentTime: getLocalDateTime() })
                    .getRawOne();
                if (result) {
                    const response = {
                        data: result
                    }
                    return response;
                } else {
                    const userSessionRepository = this.dataSource.getRepository(UserSession);
                    // Cleaning upon old session
                    userSessionRepository.delete({ id : sessionId });
                }
            }
        }
        const errorDetails = {
            error: {
                user: "Unauthorized"
            }
        }
        return errorDetails;
    }

    async login(loginData: UserLoginInputs): Promise<IResponse> {
        try {
            const validUser = await validUserLoginSchema.validate(loginData);
            const userRepository = this.dataSource.getRepository(User);
            const userExists = await userRepository.findOneBy({ email: validUser.email });
            if (userExists) {
                const validPassword = await bcrypt.compare(validUser.password, userExists.password);
                if (validPassword) {
                    const userSessionRepository = this.dataSource.getRepository(UserSession);
                    const sessionId = crypto.randomBytes(UserModel.hashLength).toString('hex');
                    const currentDateTime = getLocalDateTime();
                    // parseInt('0.1') => 0 so used parseFloat('0.1') => 0.1
                    const cookieExpiredTime = new Date(currentDateTime.getTime() + (parseFloat(process.env.COOKIE_EXPIRY_IN_HRS ?? '1' ) * 60 * 60 * 1000));
                    const userSession = new UserSession(sessionId, userExists, currentDateTime, cookieExpiredTime);
                    const sessionDetails = await userSessionRepository.save(userSession);
                    const response = {
                        message: "Login successful",
                        data: {
                            sessionId: sessionDetails.id,
                            userId: sessionDetails.user.id,
                            name: sessionDetails.user.name,
                            email: sessionDetails.user.email
                        }
                    }
                    return response;
                }
            }
            throw new Yup.ValidationError("Login failed", '', 'login');
        } catch (error: any) {
            const errorDetails = {
                error: {
                    [error.path]: `${error.errors.join()}`
                }
            }
            return errorDetails;
        }
    }


    async logout (sessionId: string | undefined): Promise<IResponse> {
        if (sessionId) {
            const userSessionRepository = this.dataSource.getRepository(UserSession);
            const result = await userSessionRepository.delete({ id: sessionId });
            const response = {
                message: "User logged out successfully"
            };
            return response;
        }
        const errorDetails = {
            error: {
                user: "Unauthorized"
            }
        }
        return errorDetails;
    }
}