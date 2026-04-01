const axios = require("axios");
const { getAccessToken } = require("./mpesaToken");

const baseUrl = (process.env.BASE_URL || "").replace(/\/$/, "");

async function registerURLs() {
  console.log(1);
  const access_token = await getAccessToken();
  console.log(2);
  console.log(access_token);
  console.log(3);
  const url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";

  const data = {
    ShortCode: process.env.MPESA_SHORTCODE, // your paybill or till number
    ResponseType: "Completed", // can be Completed or Cancelled
    ConfirmationURL: `${baseUrl}/mpesa/confirmation`,
    ValidationURL: `${baseUrl}/mpesa/validation`,
  };

  if (!baseUrl) {
    throw new Error("BASE_URL is required to register M-Pesa callback URLs.");
  }

  try {
    console.log(4);
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    console.log("Registration success:", response.data);
  } catch (error) {
    console.error(
      "Error registering URLs:",
      error.response?.data || error.message
    );
  }
}

module.exports = registerURLs;
