import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schedura.app',
  appName: 'schedura-app',
  webDir: 'dist',
  server: {
    url: 'https://3cb02f86-70af-4016-9624-1cbc9792e5f9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
