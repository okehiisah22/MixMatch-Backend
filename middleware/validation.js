exports.validatePortfolio = {
  createGallery: (req, res, next) => {
    const schema = Joi.object({
      title: Joi.string().max(100).required(),
      description: Joi.string().max(500),
      eventDate: Joi.date(),
      tags: Joi.array().items(Joi.string().max(20)),
      location: Joi.object({
        venue: Joi.string(),
        city: Joi.string(),
        country: Joi.string(),
      }),
    });
    validateRequest(req, res, next, schema);
  },

  createTestimonial: (req, res, next) => {
    const schema = Joi.object({
      djId: Joi.string().required(),
      text: Joi.string().max(1000).required(),
      rating: Joi.number().min(1).max(5),
    });
    validateRequest(req, res, next, schema);
  },
};

function validateRequest(req, res, next, schema) {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
}
