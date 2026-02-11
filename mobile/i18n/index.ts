import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import hi from './locales/hi.json';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
};

const initI18n = async () => {
    let savedLanguage = await AsyncStorage.getItem('user-language');

    if (!savedLanguage) {
        savedLanguage = Localization.getLocales()[0].languageCode;
    }

    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: savedLanguage || 'en',
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false,
            },
            react: {
                useSuspense: false,
            },
        });
};

initI18n();

export default i18n;
