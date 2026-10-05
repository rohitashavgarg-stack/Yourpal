import { Platform } from 'react-native';

// What the phone calls its health store. Web shows the iOS name.
export const HEALTH_NAME = Platform.OS === 'android' ? 'Health Connect' : 'Apple Health';
