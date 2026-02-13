import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import React from 'react';
import api from './api';

WebBrowser.maybeCompleteAuthSession();

// You should get these from your Google Cloud Console
// For Expo Go / Development, you can use the Web Client ID
const WEB_CLIENT_ID = '5580082365-mvv3lhsur4f3i06basr8gnmn1bveh0uj.apps.googleusercontent.com'; // Placeholder - user needs to provide or I'll ask to replace
const ANDROID_CLIENT_ID = '5580082365-p609s4qmpqu32v2j9bc9i0iq0oohp02.apps.googleusercontent.com';


export const googleAuthService = {
    useGoogleAuth: () => {
        // Google Cloud Console does not accept 'exp://' URIs.
        // We must use the Expo Auth Proxy for Expo Go on physical devices.
        // URI format: https://auth.expo.io/@<your-expo-username>/<project-slug>
        const EXPO_USERNAME = 'okkkkbhai'; // Matches the logged-in Expo user
        const PROJECT_SLUG = 'digital-dwell';  // Matches app.json slug
        const redirectUri = `https://auth.expo.io/@${EXPO_USERNAME}/${PROJECT_SLUG}`;

        const [request, response, promptAsync] = Google.useAuthRequest({
            androidClientId: WEB_CLIENT_ID, // Use WEB_CLIENT_ID for Expo Go
            iosClientId: WEB_CLIENT_ID,
            webClientId: WEB_CLIENT_ID,
            responseType: AuthSession.ResponseType.IdToken,
            redirectUri: redirectUri,
            scopes: ['profile', 'email'],
        });

        React.useEffect(() => {
            console.log('--- Google Auth Config ---');
            console.log('Generated Redirect URI:', redirectUri);
        }, [redirectUri]);

        React.useEffect(() => {
            if (response?.type === 'success') {
                console.log('--- AUTH SUCCESS (Effect) ---');
            } else if (response?.type === 'error') {
                console.error('--- AUTH ERROR (Effect) ---', response.error);
            }
        }, [response]);

        const handleGoogleLogin = async () => {
            console.log('--- Google Login Start ---');
            console.log('Please ensure this URI is in Google Console:', redirectUri);

            if (!request) {
                throw new Error('Google authentication is not ready. Please try again.');
            }

            try {
                const result = await promptAsync();
                console.log('PROMPT RESULT:', JSON.stringify(result, null, 2));

                if (result?.type === 'success') {
                    const { id_token } = result.params;
                    // Also check authentication object if present
                    const token = id_token || result.authentication?.idToken;

                    if (!token) throw new Error('No identity token received.');

                    console.log('Sending token to backend...');
                    const authResponse = await api.post('/auth/google', { idToken: token });
                    return authResponse.data;
                }
            } catch (error: any) {
                console.error('Login error:', error);
                throw error;
            }
            throw new Error('Google Sign-In was cancelled or failed.');
        };

        return {
            handleGoogleLogin,
            isDisabled: !request
        };
    }
};
