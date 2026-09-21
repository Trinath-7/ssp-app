import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sspproperties.loans',
  appName: 'SSP Properties & Loans',
  webDir: 'public',
  server: {
    // Connects native Android WebView to the running Next.js application on the public tunnel or local network
    url: process.env.CAPACITOR_SERVER_URL || 'https://stack-harvest-alumni-tommy.trycloudflare.com',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#064e3b',
  },
};

export default config;
