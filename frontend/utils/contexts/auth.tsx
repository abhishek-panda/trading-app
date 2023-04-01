import React, { createContext, useContext, PropsWithChildren, useEffect } from "react";
import { useAppDispatcher, useAppSelector } from "../../store/hooks";
import LoadingPage from "../../pages/AlgoTrade/Loading";
import { fetchUser } from "../../reducers/userSlice";
import { User, UserLoginInputs } from "../../../libs/typings";
import { Loader } from "../../components";
import { loginUser, logoutUser } from "../../reducers/userSlice";

interface IAuthContext {
	user?: User;
	login: (user: UserLoginInputs) => void;
	logout: () => void;
}

let initialAuthContextState: IAuthContext | undefined;
const AuthContext = createContext(initialAuthContextState);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const userData = useAppSelector((state) => state.userData);
	const dispatch = useAppDispatcher();

	const login = (inputData: UserLoginInputs) => {
		dispatch(loginUser(inputData));
	};

	const logout = () => {
		dispatch(logoutUser());
	};

	useEffect(() => {
		dispatch(fetchUser());
	}, []);

	return (
		<AuthContext.Provider value={{ user: userData.user, login, logout }}>
			{!(userData.hasFetched === true && userData.loading === false) ? <LoadingPage><Loader diameter={100} thickness={6}></Loader></LoadingPage> : children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
