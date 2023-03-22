import React from "react";
import { NavLink } from 'react-router-dom';
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
	LoginLinkWrapper
} from "./style";
import { Card, Button, Seperator, Input, Link } from "../../components";

const Register = () => {
	return (
		<RegisterPageWrapper>
			<Card>
				<CardLogo>
					<img src="https://themewagon.com/wp-content/uploads/2021/03/Frame-172-1.png" />
				</CardLogo>

				<GreetingMessage>
					<h2>Sign up</h2>
					<span>Enter your credentials to continue</span>
				</GreetingMessage>

				<SignUpBtnWrapper>
					<Button>
						<SignUpWithGoogleImg src="https://img.freepik.com/free-icon/google_318-278809.jpg?w=2000" />
						<SignUpWithGoogleText>Sign Up with Google</SignUpWithGoogleText>
					</Button>
				</SignUpBtnWrapper>

				<SeperatorWrapper>
					<Seperator />
					<SeperatorText>OR</SeperatorText>
				</SeperatorWrapper>

				<SignUpWithEmail>Sign up with Email address</SignUpWithEmail>

				<form>
					<InputWrapper>
						<Input name="Name"  type="text" />
					</InputWrapper>

					<InputWrapper>
						<Input name="Email Address / Username"  type="text" />
					</InputWrapper>

					<InputWrapper>
						<Input name="Password" type="password" />
					</InputWrapper>

					<SignUpBtnWrapper>
						<Button buttonColor="rgb(103, 58, 183)" hasBorder={false}>
							<SignUpText>Sign Up</SignUpText>
						</Button>
					</SignUpBtnWrapper>
				</form>
				<Seperator />
				<LoginLinkWrapper>
					<NavLink to="/login">Already have an account?</NavLink>
				</LoginLinkWrapper>
			</Card>
		</RegisterPageWrapper>
	);
};

export default Register;
