import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.stegx",
  appName: "StegX",
  webDir: "dist",
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: "StegXApp",
    overrideUserAgent: "StegXApp/1.0.0 (Android)",
    backgroundColor: "#0a0a0a",
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      releaseType: "APK"
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0a0a0a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    Camera: {
      permissions: {
        camera: "required",
        photos: "required"
      }
    },
    Filesystem: {
      permissions: {
        storage: "required",
        photos: "required"
      }
    },
    Share: {
      permissions: {
        photos: "required"
      }
    },
    CapacitorHttp: {
      enabled: true
    }
  },
};

export default config;
