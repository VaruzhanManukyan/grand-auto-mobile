module.exports = {
  expo: {
    name: "Grand Auto",
    slug: "grand-auto",
    owner: "varuzhan",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/images/icon.png",
    scheme: "grandauto",
    ios: {
      icon: "./assets/expo.icon",
      bundleIdentifier: "grandauto",
      infoPlist: {
        LSApplicationQueriesSchemes: [
          "comgooglemaps",
          "waze",
          "yandexnavi",
          "yandexmaps",
          "dgis"
        ]
      }
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      predictiveBackGestureEnabled: false,
      package: "com.varuzhan.grandauto",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
          android: {
            image: "./assets/images/splash-icon.png",
            imageWidth: 76
          }
        }
      ],
      "expo-localization",
      "expo-secure-store",
      "./plugins/with-map-queries.js"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    }
  }
};