import { toast } from "react-toastify";

export enum ToastType {
	INFO = 'info',
	SUCCESS = 'success',
	WARN = 'warn',
	ERROR = 'error',
	DEFAULT = 'default'
}

const showToast = (type: ToastType, message: string) => {
	const toaster = (type === ToastType.DEFAULT) ? toast : toast[type];
	toaster(message, {
		position: "bottom-right",
		autoClose: 5000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
		theme: "dark",
	});
};

export default showToast;
