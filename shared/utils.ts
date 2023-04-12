import * as Yup from "yup";
import { TradingTimeFrame } from "./typings";


export const validuuId =  /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
export const validAlphaNumericText = /^[A-Za-z0-9\s]{3,100}$/;
/**
 * User
 */
export const validUserName = validAlphaNumericText;
export const validEmail = /^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
export const validPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;


/**
 * Broker
 */
export const validBrokerName = validAlphaNumericText;

/**
 * Broker Client
 */
export const validBrokerClientId = validuuId;
export const validBrokerClientName = validAlphaNumericText;
export const validBrokerClientApiKey = /^[A-Za-z0-9]{3,100}$/;
export const validBrokerClientSecret = /^[A-Za-z0-9]{3,100}$/;

/**
 * Strategy
 */
export const validStrategyId =  /^[A-Za-z0-9\s_]{3,100}$/;
export const validStrategyName = validAlphaNumericText;
export const validStrategyDescription = /^[A-Za-z0-9\s._,]{20,200}$/;

/** Subscription */
export const validSubscriptionName = validAlphaNumericText;

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
  apiKey: Yup.string().required("Required").matches(validBrokerClientApiKey, "Invalid API Key"),
  secret: Yup.string().required("Required").matches(validBrokerClientSecret, "Invalid secret"),
  broker: Yup.string().required("Required").matches(validBrokerName, "Invalid Broker")
})

export const validStrategySchema = Yup.object({
  sid: Yup.string().required("Required").matches(validStrategyId, "Invalid Id"),
  name: Yup.string().required("Required").matches(validStrategyName, "Invalid Name"),
  description : Yup.string().required("Required").matches(validStrategyDescription, "Invalid Description"),
});

export const validSubscriptionSchema = Yup.object({
  name: Yup.string().required("Required").matches(validSubscriptionName, "Invalid Name"),
  brokerClientId : Yup.string().required("Required").matches(validBrokerClientId, "Invalid Broker Client"),
  strategyId : Yup.string().required("Required").matches(validStrategyId, "Invalid Strategy"),
  timeframe: Yup.mixed().oneOf(Object.values(TradingTimeFrame)).defined().required("Required")
});



export const getEnumKeys = (enumType: any): string[] => {
  return Object.keys(enumType).filter(key => isNaN(Number(key)));
}
