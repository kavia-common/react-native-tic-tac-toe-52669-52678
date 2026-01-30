#!/usr/bin/env sh
# CI environments for this kata may attempt to run `./gradlew` from the repository root.
# This repo is an Expo (managed) React Native app; a native Android project (and real
# Gradle wrapper) is generated via Expo prebuild inside tic_tac_toe_frontend/.
#
# To generate Android native project + real gradlew:
#   cd react-native-tic-tac-toe-52669-52678/tic_tac_toe_frontend
#   npm run prebuild:android
#
# Until then, we provide this stub so the failure is explicit and actionable.

echo "No native Android Gradle wrapper found at repo root."
echo "This project is Expo-managed. Generate the native Android project with:"
echo "  cd tic_tac_toe_frontend && npm run prebuild:android"
exit 1
