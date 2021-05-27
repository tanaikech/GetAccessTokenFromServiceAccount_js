# GetAccessTokenFromServiceAccount_js

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENCE)

<a name="top"></a>

# Overview

This is a Javascript library to retrieve the access token from the Google Service Account. [Ref](https://cloud.google.com/iam/docs/service-accounts)

# Description

I have already posted the sample script for retrieving the access token from the Google Service Account. [Ref](https://tanaikech.github.io/2020/12/19/retrieving-access-token-for-service-account-using-javascript/) But, when I use this script, I thought that when this was published as the Javascript library, it will be useful. So I created this.

# Install

```html
<script src="getaccesstokengromserviceaccount_js.min.js"></script>
```

Or, using jsdelivr cdn

```html
<script src="https://cdn.jsdelivr.net/gh/tanaikech/GetAccessTokenFromServiceAccount_js@master/getaccesstokengromserviceaccount_js.min.js"></script>
```

<a name="method"></a>

# Method

| Method     | Explanation                                        |
| :--------- | :------------------------------------------------- |
| do(object) | Retrieve the access token from the service account |

<a name="usage"></a>

# Usage

## Sample script

When the API key is used, the values can be retrieved from only the publicly shared folder. Please be careful this. If you want to retrieve the folder which is not shared in your Google Drive, [please use the access token](#useaccesstoken).

```html
<script src="getfilelist_js.min.js"></script>

<script>
  const obj = {
    private_key: "-----BEGIN PRIVATE KEY-----\n###-----END PRIVATE KEY-----\n",
    client_email: "###",
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    // userEmail: "###",
  };
  const p = GetAccessTokenFromServiceAccount.do(obj)
    .then((res) => console.log(res.access_token))
    .catch((err) => console.log(err));
</script>
```

- Please set the values of `private_key`, `client_email` and `scopes` to the object like above, and give it as the argument of `GetAccessTokenFromServiceAccount.do(obj)`.

- If you want to use the personal email for the service account, please include the property of `userEmail` to the object. In this case, the domain-wide delegation is required to be enabled. [Ref](https://developers.google.com/identity/protocols/oauth2/service-account#creatinganaccount)

# Appendix

## Sample 1

In the current stage (May 27, 2021), Google API Client Library (gapi) for JavaScript cannot directly use the service account. But, when this library is used, gapi can be used with the service account. The sample script is as follows.

```html
<input type="button" value="Run" onClick="run()" />

<script src="https://cdn.jsdelivr.net/gh/tanaikech/GetAccessTokenFromServiceAccount_js@master/getaccesstokengromserviceaccount_js.min.js"></script>
<script
  async
  defer
  src="https://apis.google.com/js/api.js"
  onload="this.onload=function(){};handleClientLoad()"
  onreadystatechange="if (this.readyState === 'complete') this.onload()"
></script>
<script>
  // Please set the service account.
  const obj = {
    private_key: "-----BEGIN PRIVATE KEY-----\n###-----END PRIVATE KEY-----\n",
    client_email: "###",
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  };

  const handleClientLoad = () =>
    gapi.load("client", async () =>
      gapi.auth.setToken(await GetAccessTokenFromServiceAccount.do(obj))
    );

  function run() {
    gapi.client
      .init({
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        ],
      })
      .then(() => {
        gapi.client.drive.files
          .list({
            pageSize: 10,
            fields: "files(name)",
          })
          .then(({ body }) => {
            console.log(body);
          });
      });
  }
</script>
```

- When this script is run, the file list of the Google Drive of the service account is obtained.

---

<a name="licence"></a>

# Licence

[MIT](licence)

<a name="author"></a>

# Author

[Tanaike](https://tanaikech.github.io/about/)

If you have any questions and commissions for me, feel free to tell me.

<a name="updatehistory"></a>

# Update History

- v1.0.0 (May 27, 2021)

  1. Initial release.

[TOP](#top)
