# CI Notes (Expo-managed React Native)

This project is **Expo-managed** (no committed native Android project by default).

## Recommended CI checks

From `tic_tac_toe_frontend/`:

- Install: `npm ci` (or `npm install`)
- Lint: `npm run lint`
- Typecheck/build (optional): `npx tsc -p tsconfig.json --noEmit`

## About Gradle / ./gradlew

A functional Gradle wrapper (`./gradlew`) is only present after generating the native Android project via:

```bash
cd tic_tac_toe_frontend
npm run prebuild:android
```

If CI is attempting to run `./gradlew` without prebuild, that is a CI pipeline configuration issue (not an app code issue).
