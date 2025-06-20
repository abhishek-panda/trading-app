import React from "react";
import { NavLink, Navigate } from "react-router-dom";
import { useFormik } from "formik";
import {
  LoginPageWrapper,
  CardLogo,
  GreetingMessage,
  SignInBtnWrapper,
  SignInWithGoogleImg,
  SignInWithGoogleText,
  SeperatorWrapper,
  SeperatorText,
  SignInWithEmail,
  InputWrapper,
  ForgotPasswordWrapper,
  SignInText,
  RegisterLinkWrapper,
} from "./style";
import { Card, Button, Seperator, Input, Link } from "../../../components";
import showToast, { ToastType } from "../../../utils/toast";
import { googleIcon, logo } from "../../../images";
import { UserLoginInputs, UserRole } from "../../../../libs/typings";
import { validUserLoginSchema } from "../../../../libs/utils";
import { useAuth } from "../../../utils/contexts/auth";

const initialValues: UserLoginInputs = {
  email: "",
  password: "",
};

const Login = () => {
  const auth = useAuth();

  const formik = useFormik({
    initialValues,
    validationSchema: validUserLoginSchema,
    onSubmit: (values, { resetForm }) => {
      auth?.login(values);
      resetForm();
    },
  });

  if (auth?.user) {
    return auth.user.role === UserRole.ADMIN ? (
      <Navigate to="/algotm/admin/algo-bots" />
    ) : (
      <Navigate to="/algotm/dashboard/algo-bots" />
    );
  }

  return (
    <LoginPageWrapper>
      <Card>
        <CardLogo>
          <img src={logo} />
        </CardLogo>

        <GreetingMessage>
          <h2>Hi, Welcome Back</h2>
          <span>Enter your credentials to continue</span>
        </GreetingMessage>

        <SignInBtnWrapper>
          <Button
            onClick={(_) => showToast(ToastType.ERROR, "Try again later!")}
          >
            <SignInWithGoogleImg src={googleIcon} />
            <SignInWithGoogleText>Sign In with Google</SignInWithGoogleText>
          </Button>
        </SignInBtnWrapper>

        <SeperatorWrapper>
          <Seperator />
          <SeperatorText>OR</SeperatorText>
        </SeperatorWrapper>

        <SignInWithEmail>Sign in with Email address</SignInWithEmail>

        <form onSubmit={formik.handleSubmit}>
          <InputWrapper>
            <Input
              label="Email Address"
              name="email"
              type="text"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email ? formik.errors.email : ""}
            />
          </InputWrapper>

          <InputWrapper>
            <Input
              label="Password"
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password ? formik.errors.password : ""}
            />
          </InputWrapper>

          <ForgotPasswordWrapper>
            <Link href="#">Forgot Password?</Link>
          </ForgotPasswordWrapper>

          <SignInBtnWrapper>
            <Button
              buttonColor="rgb(103, 58, 183)"
              hasBorder={false}
              type="submit"
            >
              <SignInText>Sign In</SignInText>
            </Button>
          </SignInBtnWrapper>
        </form>
        <Seperator />
        <RegisterLinkWrapper>
          <NavLink to="/algotm/register">Don't have an account?</NavLink>
        </RegisterLinkWrapper>
        <RegisterLinkWrapper>
          <NavLink to="/algotm/dashboard/home">Home</NavLink>
        </RegisterLinkWrapper>
      </Card>
    </LoginPageWrapper>
  );
};

export default Login;
