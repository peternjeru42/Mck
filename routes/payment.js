// const { Router } = require("express");
// const { monthlyStatement } = require("../controllers/payment");

// //create an instance of a router
// const router = new Router();

// router.get("/:admNo/:year/:month", monthlyStatement);

// module.exports = router;

/////NEW CODE!!!!!!!!!!!!!!

const { Router } = require("express");
const {
  testPayment,
  create,
  get,
  getOne,
  deletepayment,
  edit,
  paymentCallback,
} = require("../controllers/payment");

const router = new Router()

router.get("/", get);
router.post("/callback", paymentCallback); // This endpoint will be called by Equity Bank webhook
router.post("/test-payment", testPayment); // TEST PAYMENT (manual simulation)
router.post("/:studentId", create);
router.get("/:id", getOne);
router.put("/:id", edit);
router.delete("/:id", deletepayment);


module.exports = router;
