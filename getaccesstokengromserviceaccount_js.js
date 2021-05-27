// This is a Javascript library to retrieve the access token from the Google Service Account.
// https://github.com/tanaikech/GetAccessTokenFromServiceAccount_js
document.write(
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/3.0.0-rc.1/jsencrypt.min.js"></script>'
);
document.write(
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js"></script>'
);

const GetAccessTokenFromServiceAccount = (function () {
  const _url = "https://www.googleapis.com/oauth2/v4/token";
  const _grant_type = "urn:ietf:params:oauth:grant-type:jwt-bearer";

  function _main(_obj) {
    return new Promise((resolve, reject) => {
      const { private_key, client_email, scopes } = _obj;
      if (!private_key || !client_email || !scopes) {
        throw new Error(
          "No required values. Please set 'private_key', 'client_email' and 'scopes'"
        );
      }
      const header = { alg: "RS256", typ: "JWT" };
      const now = Math.floor(Date.now() / 1000);
      const claim = {
        iss: client_email,
        scope: scopes.join(" "),
        aud: _url,
        exp: (now + 3600).toString(),
        iat: now.toString(),
      };
      if (_obj.userEmail) {
        claim.sub = _obj.userEmail;
      }
      const signature =
        btoa(JSON.stringify(header)) + "." + btoa(JSON.stringify(claim));
      const sign = new JSEncrypt();
      sign.setPrivateKey(private_key);
      const jwt =
        signature + "." + sign.sign(signature, CryptoJS.SHA256, "sha256");
      const params = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assertion: jwt,
          grant_type: _grant_type,
        }),
      };
      fetch(_url, params)
        .then((res) => res.json())
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }

  return { do: _main };
})();
