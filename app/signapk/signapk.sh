#!/bin/bash  
rm -f signapk/app.* && touch signapk/app.apk
ionic cordova build android --prod --release
/root/Android/Sdk/build-tools/30.*/./zipalign -f -v 4  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk signapk/app.apk
/root/Android/Sdk/build-tools/30.*/./apksigner sign --ks signapk/my-release-key.jks --ks-pass pass:H1br1d@! --key-pass pass:H1br1d@! --ks-key-alias aupet signapk/app.apk 
chown -R gabriel:gabriel $(pwd)