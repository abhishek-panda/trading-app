import React from "react";
import { NavLink } from 'react-router-dom';
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
	RegisterLinkWrapper
} from "./style";
import { Card, Button, Seperator, Input, Link } from "../../components";

const Login = () => {
	return (
		<LoginPageWrapper>
			<Card>
				<CardLogo>
					<img src="https://themewagon.com/wp-content/uploads/2021/03/Frame-172-1.png" />
				</CardLogo>

				<GreetingMessage>
					<h2>Hi, Welcome Back</h2>
					<span>Enter your credentials to continue</span>
				</GreetingMessage>

				<SignInBtnWrapper>
					<Button>
						<SignInWithGoogleImg src="https://img.freepik.com/free-icon/google_318-278809.jpg?w=2000" />
						<SignInWithGoogleText>Sign In with Google</SignInWithGoogleText>
					</Button>
				</SignInBtnWrapper>

				<SeperatorWrapper>
					<Seperator />
					<SeperatorText>OR</SeperatorText>
				</SeperatorWrapper>

				<SignInWithEmail>Sign in with Email address</SignInWithEmail>

				<form>
					<InputWrapper>
						<Input name="Email Address / Username"  type="text" />
					</InputWrapper>

					<InputWrapper>
						<Input name="Password" type="password" />
					</InputWrapper>

					<ForgotPasswordWrapper>
						<Link href="#">Forgot Password?</Link>
					</ForgotPasswordWrapper>

					<SignInBtnWrapper>
						<Button buttonColor="rgb(103, 58, 183)" hasBorder={false}>
							<SignInText>Sign In</SignInText>
						</Button>
					</SignInBtnWrapper>
				</form>
				<Seperator />
				<RegisterLinkWrapper>
					<NavLink to="/register">Don't have an account?</NavLink>
				</RegisterLinkWrapper>
			</Card>
		</LoginPageWrapper>
	);
};

export default Login;
