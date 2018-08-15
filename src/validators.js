import Joi from 'joi'

const validateEndpointDonationSchema = Joi.object().keys({
  redirect: Joi.string().uri(),
  lang: Joi.string(),
  descriptor: Joi.string(),
  timezone_offset: Joi.number(),
  form: Joi.object().keys({
    name: Joi.string(),
    last_name: Joi.string(),
    email: Joi.string()
      .email()
      .required(),
    // address: Joi.string(),
    // zip: Joi.string(),
    // city: Joi.string(),
    // state: Joi.string(),
    // country: Joi.string(),
    amount: Joi.number()
      .integer()
      .required(),
    interval: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    currency: Joi.string().required(),
    payFee: Joi.boolean(),
    newsletter: Joi.boolean(),
    fees: Joi.number(),
    total: Joi.number(),
    comment: Joi.string(),
  }),
})

export const validateEndpointDonation = obj =>
  Joi.validate(obj, validateEndpointDonationSchema)

const validateEndpointStripeSchema = Joi.object().keys({
  redirect: Joi.string().uri(),
  lang: Joi.string(),
  descriptor: Joi.string(),
  timezoneOffset: Joi.number(),
  form: Joi.object().keys({
    name: Joi.string(),
    lastname: Joi.string(),
    email: Joi.string()
      .email()
      .required(),
    address: Joi.string(),
    zip: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    amount: Joi.number()
      .integer()
      .required(),
    interval: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    currency: Joi.string().required(),
    payFee: Joi.boolean(),
    newsletter: Joi.boolean(),
    fees: Joi.number(),
    total: Joi.number(),
  }),
})

export const validateEndpointStripe = obj =>
  Joi.validate(obj, validateEndpointStripeSchema)
