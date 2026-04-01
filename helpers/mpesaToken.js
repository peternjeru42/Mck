const axios = require("axios");

const consumer_key = process.env.MPESA_CONSUMER_KEY;
const consumer_secret = process.env.MPESA_CONSUMER_SECRET;
const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString(
  "base64"
);

async function getAccessToken() {
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    console.log(response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Failed to get access token:",
      error.response?.data || error.message
    );
  }
}

console.log("Access Token function:", typeof getAccessToken);
module.exports = { getAccessToken };
