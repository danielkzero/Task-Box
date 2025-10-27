@echo off
SETLOCAL

:: Caminho da imagem base
:: set BASE_IMAGE=resources\background.png

:: Caminho do res
:: set RES_PATH=android\app\src\main\res

:: Tamanhos para Android
:: set MDPI=48
:: set HDPI=72
:: set XHDPI=96
:: set XXHDPI=144
:: set XXXHDPI=192

:: Criar pastas caso não existam
:: mkdir %RES_PATH%\mipmap-mdpi
:: mkdir %RES_PATH%\mipmap-hdpi
:: mkdir %RES_PATH%\mipmap-xhdpi
:: mkdir %RES_PATH%\mipmap-xxhdpi
:: mkdir %RES_PATH%\mipmap-xxxhdpi

:: Gerar backgrounds
:: magick %BASE_IMAGE% -resize %MDPI%x%MDPI% %RES_PATH%\mipmap-mdpi\ic_launcher_background.png
:: magick %BASE_IMAGE% -resize %HDPI%x%HDPI% %RES_PATH%\mipmap-hdpi\ic_launcher_background.png
:: magick %BASE_IMAGE% -resize %XHDPI%x%XHDPI% %RES_PATH%\mipmap-xhdpi\ic_launcher_background.png
:: magick %BASE_IMAGE% -resize %XXHDPI%x%XXHDPI% %RES_PATH%\mipmap-xxhdpi\ic_launcher_background.png
:: magick %BASE_IMAGE% -resize %XXXHDPI%x%XXXHDPI% %RES_PATH%\mipmap-xxxhdpi\ic_launcher_background.png

:: call npx @capacitor/assets generate

:: echo Assets gerados com sucesso!

echo Compilando aplicação!
call npm run build

echo Limpando compilação anterior em \android
cd android
call gradlew clean
cd..

echo Copiando construção para \android
call npx cap copy android

echo Sincronizando \android
call npx cap sync android

echo Navegando para \android!
cd android

echo Gerando apk
call gradlew assembleRelease
cd..
echo Concluído :)
pause
