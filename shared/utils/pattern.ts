export const tokenExpression = /^Bearer [a-zA-Z0-9]+$/;                                                 // Session token
export const userNameExpresson =   /^[A-Za-z ]{3,20}$/;                                                 // User name
export const emailExpression = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;                      // email experssion
export const passwordExpression = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;     // password expression