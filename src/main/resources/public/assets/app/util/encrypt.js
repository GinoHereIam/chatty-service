import Base64 from "crypto-js/enc-base64";
import sha1 from "crypto-js/sha1";

export function encrypt(input) {
    return Base64.stringify(sha1(input));
}