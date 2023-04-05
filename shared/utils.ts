import * as Yup from "yup";
import { BROKER } from "./typings";

export const validUserName = /^[A-Za-z ]{3,20}$/;
export const validEmail = /^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
export const validPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
export const brokerClientName = /^[A-Za-z ]{3,20}$/;
export const clientApiKey = /^[A-Za-z]{3,20}$/;


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


export const validUserLoginSchema = Yup.object({
  email: Yup.string().required("Required").matches(validEmail, "Invalid email format"),
  password: Yup.string().required('Required').matches(validPassword,
    "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character")
});

export const validateBrokerClientSchema = Yup.object({
  cname: Yup.string().required("Required").matches(brokerClientName, "Invalid Broker Client Name"),
  apiKey: Yup.string().required("Required").matches(clientApiKey, "Invalid API Key"),
  broker: Yup.mixed().oneOf(Object.values(BROKER)).defined().required("Required")
})