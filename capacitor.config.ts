import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sspproperties.loans',
  appName: 'SSP Properties & Loans',
  webDir: 'public',
  server: {
    // Connects native Android WebView to permanent Vercel production deployment
    url: process.env.CAPACITOR_SERVER_URL || 'https://ssp-app-trinath-7s-projects.vercel.app',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#064e3b',
  },
};

export default config;
