import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch} from './index';


export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatcher = () => useDispatch<AppDispatch>();
