import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ninjawallet.app',
  appName: 'Ninja Wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'ninjawallet.app'
  },
  android: {
    buildOptions: {
      keystorePath: 'ninja-wallet.keystore',
      keystoreAlias: 'ninjawallet'
    }
  },
  ios: {
    scheme: 'NinjaWallet'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#4F46E5",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
