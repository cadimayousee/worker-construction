import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import 'localstorage-polyfill';
import 'react-native-get-random-values'          
import { fireDB } from './firebase';
import { Directus } from '@directus/sdk';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import { I18nManager } from 'react-native';
import localized_strings from './i18n/supportedLanguages';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { store , persistor} from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import Navigation from './navigation';


export default function App() {
  React.useEffect(() => {
    i18n.translations = localized_strings;
    const locale = Localization.locale;
    i18n.locale = locale;
    i18n.fallbacks = true;

    if(i18n.locale.includes('ar')) { //arabic so support rtl
      I18nManager.allowRTL(true);  
      I18nManager.forceRTL(true); 
    }
    else{
      I18nManager.allowRTL(false);  
      I18nManager.forceRTL(false); 
    }
  },[]);

  return (
    <><Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <Navigation />
        </SafeAreaProvider>
    </PersistGate>
  </Provider><Toast /></>
  );
}

