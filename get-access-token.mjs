// Base64 encode/decoder copied from following links, MIT licensed.
// https://deno.land/std/encoding/base64.ts?source=
// https://deno.land/std/encoding/base64url.ts?source=
const base64abc = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
  "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d",
  "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s",
  "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7",
  "8", "9", "+", "/",
];

function convertBase64ToBase64url(b64) {
  return b64.endsWith("=")
    ? b64.endsWith("==")
      ? b64.replace(/\+/g, "-").replace(/\//g, "_").slice(0, -2)
      : b64.replace(/\+/g, "-").replace(/\//g, "_").slice(0, -1)
    : b64.replace(/\+/g, "-").replace(/\//g, "_");
}

function encodeBase64(data2) {
  const data = new Uint8Array(data2);
  let result = "",
    i;
  const l = data.length;
  for (i = 2; i < l; i += 3) {
    result += base64abc[data[i - 2] >> 2];
    result += base64abc[((data[i - 2] & 0x03) << 4) | (data[i - 1] >> 4)];
    result += base64abc[((data[i - 1] & 0x0f) << 2) | (data[i] >> 6)];
    result += base64abc[data[i] & 0x3f];
  }
  if (i === l + 1) {
    result += base64abc[data[i - 2] >> 2];
    result += base64abc[(data[i - 2] & 0x03) << 4];
    result += "==";
  }
  if (i === l) {
    result += base64abc[data[i - 2] >> 2];
    result += base64abc[((data[i - 2] & 0x03) << 4) | (data[i - 1] >> 4)];
    result += base64abc[(data[i - 1] & 0x0f) << 2];
    result += "=";
  }
  return result;
}

function encodeB64Url(str) {
  return convertBase64ToBase64url(encodeBase64(str));
}

function decodeBase64(b64) {
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

const token_url = "https://oauth2.googleapis.com/token";
const grant_type = "urn:ietf:params:oauth:grant-type:jwt-bearer";
const enc = new TextEncoder();

async function getToken({ private_key, client_email, scopes }) {
  const pkey = await crypto.subtle.importKey(
    "pkcs8",
    decodeBase64(private_key.trimEnd().split("\n").slice(1, -1).join("\n")),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: client_email,
    scope: scopes.join(" "),
    aud: token_url,
    exp: (now + 3600).toString(),
    iat: now.toString(),
  };

  const body =
    encodeB64Url(enc.encode(JSON.stringify(header))) +
    "." +
    encodeB64Url(enc.encode(JSON.stringify(payload)));

  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    pkey,
    enc.encode(body)
  );
  const encodedSig = encodeB64Url(signature);
  const jwt = body + "." + encodedSig;

  const params = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assertion: jwt,
      grant_type: grant_type,
    }),
  };
  return fetch(token_url, params).then((res) => res.json());
}

export default getToken;