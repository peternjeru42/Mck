// require("dotenv").config();

// const getAccessToken = require("./helpers/mpesaToken");

// (async () => {
//   const token = await getAccessToken();
//   console.log("Access Token:", token);
// })();

const getAccessToken = require('./helpers/mpesaToken');

(async () => {
  const token = await getAccessToken();
  console.log('Access Token:', token);
})();
