import React from "react";
import styled, { keyframes } from "styled-components";

const popupAnimation = keyframes`
	0% { transform: scale(1.2); opacity: 0; }
	100% { transform: scale(1); opacity: 1; }
`;

const blurAnimation = keyframes`
	0% { filter: blur(12px); }
	100% { filter: blur(0px); }
`;

const ComingSoonWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100%;
`;

const HomeContent = styled.div`
	padding: 0 10px;
	margin: 0 auto;
	max-width: 960px;
	text-align: center;
	animation: ${blurAnimation} 2s;
`;

const Title = styled.h2`
	font-size: 50px;
	margin-bottom: 0;
	animation: ${popupAnimation} 2s;
`;

const ComingSoon = () => {
	return (
		<ComingSoonWrapper>
			<HomeContent>
				<Title>Coming Soon</Title>
				<p>Something will appear here</p>
			</HomeContent>
		</ComingSoonWrapper>
	);
};

export default ComingSoon;
