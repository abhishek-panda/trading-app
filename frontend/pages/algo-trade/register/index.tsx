import React from 'react';
import { NavLink, Navigate } from "react-router-dom";
import { useFormik } from "formik";
import {
	RegisterPageWrapper,
	CardLogo,
	GreetingMessage,
	SignUpBtnWrapper,
	SignUpWithGoogleImg,
	SignUpWithGoogleText,
	SeperatorWrapper,
	SeperatorText,
	SignUpWithEmail,
	InputWrapper,
	SignUpText,
	LoginLinkWrapper,
} from "./style";
import { Card, Button, Seperator, Input } from "../../../components";
import showToast, { ToastType } from "../../../utils/toast";
import { useAppSelector, useAppDispatcher } from "../../../store/hooks";
import { googleIcon, logo }  from '../../../images';
import { registerUser } from "../../../reducers/userSlice";
import { UserRegistrationInputs } from '../../../../libs/typings'
import { validUserRegistrationSchema } from '../../../../libs/utils';

const initialValues: UserRegistrationInputs = {
	uname: "",
	email: "",
	password: "",
};

const Register = () => {

	const user = useAppSelector(state => state.userData.user);
	const dispatch = useAppDispatcher();

	const formik = useFormik({
		initialValues,
		validationSchema: validUserRegistrationSchema,
		onSubmit: (values, { resetForm }) => {
			dispatch(registerUser(values));
			resetForm();
		},
	});

	if (user) {
		return <Navigate to="/algotm/dashboard/home" />
	}

	return (
		<RegisterPageWrapper>
			<Card>
				<CardLogo>
					<img src={logo} />
				</CardLogo>

				<GreetingMessage>
					<h2>Sign up</h2>
					<span>Enter your credentials to continue</span>
				</GreetingMessage>

				<SignUpBtnWrapper>
					<Button
						onClick={(_) => showToast(ToastType.ERROR, "Try again later!")}
					>
						<SignUpWithGoogleImg src={googleIcon} />
						<SignUpWithGoogleText>Sign Up with Google</SignUpWithGoogleText>
					</Button>
				</SignUpBtnWrapper>

				<SeperatorWrapper>
					<Seperator />
					<SeperatorText>OR</SeperatorText>
				</SeperatorWrapper>

				<SignUpWithEmail>Sign up with Email address</SignUpWithEmail>

				<form onSubmit={formik.handleSubmit}>
					<InputWrapper>
						<Input
							label="Name"
							name="uname"
							type="text"
							value={formik.values.uname}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							error={formik.touched.uname ? formik.errors.uname : ""}
						/>
					</InputWrapper>

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
							name="password"
							type="password"
							value={formik.values.password}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							error={formik.touched.password ? formik.errors.password : ""}
						/>
					</InputWrapper>

					<SignUpBtnWrapper>
						<Button buttonColor="rgb(103, 58, 183)" hasBorder={false}>
							<SignUpText>Sign Up</SignUpText>
						</Button>
					</SignUpBtnWrapper>
				</form>
				<Seperator />
				<LoginLinkWrapper>
					<NavLink to="/algotm/login">Already have an account?</NavLink>
				</LoginLinkWrapper>
			</Card>
		</RegisterPageWrapper>
	);
};

export default Register;
