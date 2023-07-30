// Copyright 2023 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const url = require('url')
const { SDK } = require('casdoor-nodejs-sdk');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors')

//init sdk
const cert = `
-----BEGIN CERTIFICATE-----
MIIE2TCCAsGgAwIBAgIDAeJAMA0GCSqGSIb3DQEBCwUAMCYxDjAMBgNVBAoTBWFk
bWluMRQwEgYDVQQDDAtjZXJ0X2xnMzdqcjAeFw0yMzA3MjkxODI0NTVaFw00MzA3
MjkxODI0NTVaMCYxDjAMBgNVBAoTBWFkbWluMRQwEgYDVQQDDAtjZXJ0X2xnMzdq
cjCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANpTvM24XVLd1dkFof6v
FomPAOnpvZAzzJivc6ryryZc9gJThNrJ8EnfOFhagaVtphaAerpkObg2I2CcOk6+
eQCVhiZENH3XCHdN5qp7Kcqi8im190rbT8cW1CsTVpIg8w/Ckokp7LUMipJN4dfa
bgkCgqlsQ0carFWXj+er0L8ZpR3DDNgATiQCNvuRYucGP/WrCrUDX8bn6GxECNmN
ICyBCYYZy4loDIgSISd4elLkl5IthAXwlukrKBqcewtsYA8eYvU4d2p10eTQlMGr
8UJ76a1jojifD20U+NdTZBzQB2utBfEatC/mMclrcMsz1wPzAQIvU0Ua2yJr0Xtk
JUStTD51qNdSPckmpTIMyHfKTqJPgV6ndxg003ZZLGuGkfIEVS/TSmFWxM80dwtK
BsE0VTav/TCrea3Wo7zfCqnk15BtXQlFO8mOgcDPA71lDBxVaZUUgPLCIOcRDI3o
Br2iIYkyYJU4qdFQghruHREd0RdMbqL/MOOlKhRUZuDOS/WuI1uwLGZO/fZuCpzK
fm6kxvmPBTXxF5pHYb/aRgugpoMaQH9O9cWopeb1vBCg25Cfnz28XTqPulhvTgcu
m/JYX8zknuXGpHTb3K2R2bCB5PDFiR2eFqJ+uVhzhWK66ARAnxq5UntxF6FKzVFB
qzNsf4HKPMNbCWwIsS5HvUObAgMBAAGjEDAOMAwGA1UdEwEB/wQCMAAwDQYJKoZI
hvcNAQELBQADggIBAL9Z9SfdJvp9gt3AZpQmokZNWPHemjfhtCluUXR3fvyX5F1G
2Pjl/7Dq8JIrPWaIw8k/DJbMixB9BHYd9NwLe5enCCZqp1EuvurDb6R9sg+CISkr
CvGI6+02L16Z17rNOKywoBNdhFxXylgBrZnUqmQtG0aVZaiSmiUQ8ATx+HJAmbIH
NVpuwuDTOY8mQw+CGVC4wOryp5/S8ReeFDvzmVHILOYH0FBHQTq4mQaXYbU9K4zy
6N+OsTgHhXZHwJWKM2SWc17NdToaMxgDnJeWPDRZLYQxHaJJmJVu7TsXY5r+wf4i
asot3/TnYPVqMP0i5LcO2B3acG403F4aU5LEzQKB8iek5kI/j94AK46g499yX9Vq
zvfveMhqgZZ0/IDen2UxsBg8BLLqlkvAw+XTLybFq+EB8VmKZ1z30K9bk/L5rlEe
oLqI+DW5WznCn0FYtwfokSNWF3eXu7xA9FQxDRHhY1xv2YHmic6lznjoUsJ0itz+
kTcRz8EeAMh4Q8aKB5zstKRo8pZASrV4W9pIEWV38wNzKD+IZs5ZiLP78pC1JB6A
tiT2oNNoQZUpLGfDyn6HkhpmiAWNFbR+Ue96ZP/wrCXp0jY+tDkWoxlQt9rLuXG1
WOBNyhqGe7utX+x2rNoSE0i2hclzD076WUhLomNsLSS3rK6ZGI9KqnK/PfA/
-----END CERTIFICATE-----
`;

const authCfg = {
  endpoint: 'https://sso.wereline.com',
  clientId: '9977130d14c2deb4fa3e',
  clientSecret: '28d09fe40e7f48295384f45de694b9334268881b',
  certificate: cert,
  orgName: 'doubleflyindustries',
}

const sdk = new SDK(authCfg);

const app = express();

app.use(cors({
  origin: 'http://localhost:9000',
  credentials: true
}))

app.get('/', (req, res) => {
  fs.readFile(path.resolve(__dirname, './index.html'), (err, data) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
});

app.get('/api/getUserInfo', (req, res) => {
  let urlObj = url.parse(req.url, true).query;
  console.log(urlObj)
  let user = sdk.parseJwtToken(urlObj.token);
  console.log(user)
  res.send(JSON.stringify(user));
});

app.post('*', (req, res) => {
  let urlObj = url.parse(req.url, true).query;
  sdk.getAuthToken(urlObj.code).then(result => {
    res.send(JSON.stringify({ token: result }));
  });
});

app.listen(8080, () => {
  console.log('Server listening at http://localhost:8080');
});
