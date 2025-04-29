const CryptoJS = require("crypto-js");

const ENCRYPTION_KEY = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16-byte key

function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
}

function decryptMessage(cipherText) {
  const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return bytes.toString(CryptoJS.enc.Utf8);
}
