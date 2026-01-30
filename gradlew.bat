@echo off
REM CI environments for this kata may attempt to run `gradlew` / `gradlew.bat` from the repo root.
REM This project is Expo-managed; generate the real Android project + Gradle wrapper via:
REM   cd tic_tac_toe_frontend
REM   npm run prebuild:android

echo No native Android Gradle wrapper found at repo root.
echo This project is Expo-managed. Generate the native Android project with:
echo   cd tic_tac_toe_frontend ^&^& npm run prebuild:android
exit /b 1
