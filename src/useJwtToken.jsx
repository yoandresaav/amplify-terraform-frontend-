
import { useState, useEffect } from 'react';
import { fetchAuthSession } from '@aws-amplify/auth';


export default function useJwtToken() {
    const [accessToken, setAccessToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const setAccessTokenAndIdToken = async () => {
        try {
            const session = await fetchAuthSession(); // Fetch the authentication session
            // console.log('Access Token:', session.tokens.accessToken.toString());
            // console.log('ID Token:', session.tokens.idToken.toString());
            setAccessToken(session.tokens.idToken.toString());
            setLoading(false);
        } catch (e) {
            console.log(e);
            setError(true);
        }
    }

    useEffect(() => {
        setAccessTokenAndIdToken();
    }, []);

    return {accessToken, loading, error};
}

