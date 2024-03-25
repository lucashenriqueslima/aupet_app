C:\Users\samoel\AppData\Local\Android\Sdk\build-tools\30.0.3\zipalign.exe -f -v 4 .\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk .\signapk\aupet.apk

C:\Users\samoel\AppData\Local\Android\Sdk\build-tools\30.0.3\apksigner.bat  sign --ks  signapk/my-release-key.jks --ks-pass pass:H1br1d@!  --ks-key-alias aupet .\signapk\aupet.apk

