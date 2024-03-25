import * as crypto from 'crypto';
const ENCRYPTION_KEY = 'lbwyBzfgzUIvXZFShJuikaWvLJhIVq36'; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16
export function encrypt(text) {
    if (process.versions.openssl <= '1.0.1f') throw new Error('OpenSSL Version too old, vulnerability to Heartbleed');
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}
export function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
// ref: https://gist.github.com/Tiriel/bff8b06cb3359bba5f9e9ba1f9fc52c0