import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatcher } from "../../../../store/hooks";
import { updateBrokerClient } from "../../../../reducers/algoSettingsSlice";
import { Card, Loader } from '../../../../components';
import styled from 'styled-components';

const PageWrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const ValidateClient = () => {
    const [searchParams] = useSearchParams();
    const validateClient = useAppSelector(state => state.algoSettings.validateClient);
	const dispatch = useAppDispatcher();

    const dataParams: Record<string, any> = {};
    for (const entry of searchParams.entries()) {
        const [param, value] = entry;
        dataParams[param] = value;
    }

    useEffect(() => {
        dispatch(updateBrokerClient(dataParams))
        window.onunload = refreshParent;
        function refreshParent() {
            window.opener.location.reload();
        }
    }, []);

    useEffect(() => {
        if (validateClient.message !== '' || validateClient.error !== '') {
            // window.close();
           
        }
    }, [validateClient.message, validateClient.error])


    return  (
        <PageWrapper>
             <Card style={{ justifyContent: 'center', alignItems: 'center'}}>
                {validateClient.loading ? 
                    (   
                        <>
                            <Loader  diameter={80} thickness={5}/>
                            <div style={{ marginTop: '30px'}}>Validating client. Hang on!!</div>
                        </>
                    ) : undefined
                }
                {validateClient.error ? <span>{validateClient.error}</span> : undefined}
                {validateClient.message ? <span>{validateClient.message}</span> : undefined}
            </Card>
        </PageWrapper>
       
    );
}

export default ValidateClient;