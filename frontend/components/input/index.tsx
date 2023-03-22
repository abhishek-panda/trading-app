import React from 'react';
import styled from "styled-components";


interface InputProps extends  React.InputHTMLAttributes<HTMLInputElement> {}


const InputWrapper = styled.div`
	display: flex;
	flex-direction: column;
	background: rgb(248, 250, 252);
	border: 1px solid rgba(0, 0, 0, 0.23);
	height: 58px;
	border-radius: 12px;
	position: relative;

	& > input {
		outline: none;
		border: none;
		background-color: transparent;
		padding: 30.5px 14px 11px;
	}

	& > label {
		top: 14px;
		left: 14px;
		position: absolute;
		font-size: 11px;
		color: rgb(105, 117, 134);
	}
`;

const Input: React.FC<InputProps> = (props) => {
	return (
		<InputWrapper>
			<input {...props} />
			<label >{props.name}</label>
		</InputWrapper>
	);
}





export default Input;
