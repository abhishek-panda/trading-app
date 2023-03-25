import React, { PropsWithChildren } from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/auth";

const RequiredAuth: React.FC<PropsWithChildren> = ({ children }) => {
	const auth = useAuth();
	if (!auth?.user){
		return <Navigate to="/algotm/login" />
	}

	return <>{children}</>;
}

export default RequiredAuth;
