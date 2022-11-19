const jwt = require("jsonwebtoken");
const axios = require("axios");

const moesifStripeFunc = async (userToken) => {
  userToken.trim();
  const token = userToken.replace("Bearer ", "");
  const userPricingId = jwt.verify(token, process.env.JWT_SECRETE_KEY);
  const moesifUserPriceId = userPricingId.moesifPricingId;
  if (moesifUserPriceId === process.env.STRIPE_PRICE_KEY) {
    const moesifUserDataResponse = await axios.post(
      "https://api.moesif.com/search/~/count/events?from=-1M&to=now",
      {
        post_filter: {
          bool: {
            should: {
              term: {
                "user_id.raw": userPricingId.id,
              },
            },
          },
        },
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.MOESIF_MANAGEMENT_KEY}`,
        },
      }
    );
    const hitCount = moesifUserDataResponse.data.hits.total;
    if (hitCount > process.env.API_CALL_LIMIT) {
      return false;
    } else if (hitCount < process.env.API_CALL_LIMIT) {
      return true;
    } else {
      return false;
    }
  } else if (moesifUserPriceId === process.env.STRIPE_PRICE_KEY_PREMIUM_USERS) {
    return true;
  } else {
    return false;
  }
};
