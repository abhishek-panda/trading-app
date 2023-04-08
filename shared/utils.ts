import * as Yup from "yup";
import { BROKER } from "./typings";

export const validUserName = /^[A-Za-z ]{3,20}$/;
export const validEmail = /^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
export const validPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
export const validBrokerClientName = /^[A-Za-z ]{3,100}$/;
export const validClientApiKey = /^[A-Za-z0-9]{3,100}$/;
export const validSecret = /^[A-Za-z0-9]{3,100}$/;
export const validStrategyID = /^[A-Z_]{3,20}$/;
export const validStrategyName = /^[A-Za-z]{3,20}$/;
export const validStrategyDescription = /^[A-Za-z -,.0-9]{20,200}$/;


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

export const validBrokerClientSchema = Yup.object({
  cname: Yup.string().required("Required").matches(validBrokerClientName, "Invalid Broker Client Name"),
  apiKey: Yup.string().required("Required").matches(validClientApiKey, "Invalid API Key"),
  secret: Yup.string().required("Required").matches(validSecret, "Invalid secret"),
  broker: Yup.mixed().oneOf(Object.values(BROKER)).defined().required("Required")
})

export const validStrategySchema = Yup.object({
  sid: Yup.string().required("Required").matches(validStrategyID, "Invalid ID"),
  name: Yup.string().required("Required").matches(validStrategyName, "Invalid Name"),
  description : Yup.string().required("Required").matches(validStrategyDescription, "Invalid Description"),
})