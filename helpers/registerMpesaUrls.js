const axios = require("axios");
const {getAccessToken} = require("./mpesaToken");

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
    ConfirmationURL: "https://mck-1-oeqm.onrender.com/payment/confirmation",
    ValidationURL: "https://mck-1-oeqm.onrender.com/payment/validation",
  };

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

 module.exports =  registerURLs;
