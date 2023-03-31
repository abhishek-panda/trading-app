import * as Yup from "yup";

export const validUserName =  /^[A-Za-z ]{3,20}$/;
export const validEmail = /^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
export const validPassword =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;


export const validUserRegistrationSchema = Yup.object({
    uname: Yup.string()
      .required("Required")
      .matches(validUserName, "Must contain minimum 3 chatacters and maximum upto 20 characters"),
    email: Yup.string()
        .required("Required")
        .matches(validEmail, "Invalid Email"),
    password: Yup.string()
      .required("Required")
      .matches(validPassword, "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"),
});