const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id: "AT9Pr7DDxXrDcS7m9reKcASA2D94CIrnCGnAJDrY5g8bbeyq-g7fjsbYG6_omU9I0SniHHQR5_yeF4wY",
  client_secret: "EI_kODKl_4XkGpMQpAKyjCuAnmCdvnXhRa9Mig0fGQk3vOQzWBE5uCembhVjpJPCFTo0PGELMlLGGGJH",
});

module.exports = paypal;