import React, { PropsWithChildren } from 'react';
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./contexts/auth";
import { UserRole } from '../../libs/typings';

interface RequiredAuth extends PropsWithChildren {
	allowedRoles: UserRole[];
}

const RequiredAuth: React.FC<RequiredAuth> = (props) => {
	const auth = useAuth();
	if (!auth?.user){
		return <Navigate to="/algotm/login" />
	} else {
		return props.allowedRoles.find(role => role === auth.user?.role) ? <Outlet/> :  <Navigate to="/algotm/login" />;
	}
}

export default RequiredAuth;
