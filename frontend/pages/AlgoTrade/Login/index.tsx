import React from 'react';
import { NavLink, Navigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from 'yup';
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
import { emailExpression, passwordExpression } from '../../../utils/patterns';
import { Card, Button, Seperator, Input, Link } from "../../../components";
import showToast, { ToastType } from "../../../utils/toast";
import { useAppSelector } from "../../../store/hooks";
import { googleIcon, logo }  from '../../../images';

interface LoginInput {
	uname: string;
	password: string;
}

const initialValues: LoginInput = {
	uname: "",
	password: "",
};

const validationSchema = Yup.object({
	uname: Yup.string().required("Required").matches(emailExpression, "Invalid email format"),
	password: Yup.string().required('Required').matches(passwordExpression,
	"Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character")
});

const Login = () => {
	const formik = useFormik({
		initialValues,
		validationSchema,
		onSubmit: (values) => {
			console.log(values);
		},
	});

	const user = useAppSelector(state => state.userData.user);

	if (user) {
		return <Navigate to="/algotm/dashboard/home" />
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
					<Button onClick={_ => showToast(ToastType.ERROR, "Try again later!")}>
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
							name="uname"
							type="email"
							value={formik.values.uname}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							error={formik.touched.uname ? formik.errors.uname : ''}
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
							error={formik.touched.password ? formik.errors.password: ''}
						/>
					</InputWrapper>

					<ForgotPasswordWrapper>
						<Link href="#">Forgot Password?</Link>
					</ForgotPasswordWrapper>

					<SignInBtnWrapper>
						<Button buttonColor="rgb(103, 58, 183)" hasBorder={false} type="submit">
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
