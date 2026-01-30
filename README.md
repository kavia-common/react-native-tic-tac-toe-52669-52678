# react-native-tic-tac-toe-52669-52678

## Tic Tac Toe (Expo / React Native)

This repository contains a simple two-player Tic Tac Toe game built with Expo + React Native.

### Run locally

```bash
cd tic_tac_toe_frontend
npm install
npm run start
```

### Note about CI Gradle checks

If CI reports an error like:

- `./gradlew: No such file or directory`

that indicates the Android Gradle wrapper is missing in the build environment (infrastructure/setup issue), not a React Native app code issue. The app is intended to be run via Expo (`npm run start`) unless an Android native project is generated via `expo prebuild`.