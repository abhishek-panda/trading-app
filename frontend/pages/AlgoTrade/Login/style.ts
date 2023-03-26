import styled from "styled-components";

export const LoginPageWrapper = styled.div`
	display: grid;
	height: 100vh;
	justify-items: center;
	align-items: center;
`;

export const CardLogo = styled.div`
	width: 60px;
	align-self: center;
	margin: 10px 0 20px 0;

	&  > img {
		width: 100%;
		object-fit: contain;
	}
`;

export const GreetingMessage = styled.div`
	align-self: center;
	margin: 10px 0;
	text-align: center;
	& h2 {
		color: rgb(103, 58, 183);
		font-size: 1.5rem;
		font-weight: 700;
		font-family: Roboto, sans-serif;
		line-height: 1.2;

	}
	& span {
		color: rgb(105, 117, 134);
		font-size: 16px;
		display: inline-block;
		margin-top: 20px;
	}
`;

export const SignInBtnWrapper = styled.div`
	padding: 15px 0;
`;

export const SignInWithGoogleImg = styled.img`
	width: 20px;
	object-fit: contain;
`;

export const SignInWithGoogleText = styled.span`
	padding: 0 20px;
	font-size: 14px;
`;

export const SeperatorWrapper = styled.div`
	display: flex;
	flex-direction: column;
	position: relative;
	justify-content: center;
	align-items: center;
	padding: 40px 0;
`;

export const SeperatorText = styled.div`
	position: absolute;
	border: 1px solid;
	background-color: white;
	width: 120px;
	text-align: center;
	line-height: 32px;
	border-radius: 10px;
	box-shadow: 0 0 0 12px #fff;
	border: 1px solid rgb(227, 232, 239);
`;

export const SignInWithEmail = styled.div`
	text-align: center;
	font-size: 14px;
	padding-bottom: 20px;
	color: rgb(18, 25, 38);
`;

export const InputWrapper = styled.div`
	margin: 8px 0;
`;

export const ForgotPasswordWrapper = styled.div`
	text-align: right;
	font-size: 14px;
	padding: 10px 0;
`;

export const SignInText = styled.span`
	color: #fff;
`;

export const RegisterLinkWrapper =  styled.div`
	text-align: center;
	padding: 15px 0;
	font-size: 13px;
	font-weight: bold;

	& a {
		text-decoration: none;
        color: rgb(18, 25, 38);
	}
`;
