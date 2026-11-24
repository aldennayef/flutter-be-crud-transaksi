/**
 * Middleware untuk validasi request menggunakan Joi schema
 * 
 * Penggunaan:
 * 1. Single source (default 'body'):
 *    router.post('/', validate(createUserSchema), controller);
 *    router.get('/:username', validate(getUserParamsSchema, 'params'), controller);
 * 
 * 2. Multi source (composite object):
 *    router.put('/:id', validate({ params: idParamSchema, body: updateUserSchema }), controller);
 */
const assignValidatedValue = (req, source, value) => {
  try {
    req[source] = value;
  } catch (err) {
    // Express 5 memiliki getter-only untuk properti tertentu seperti req.query
    Object.defineProperty(req, source, {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
};

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    // Cek apakah schema berupa composite object { body, params, query }
    const isComposite = schema && !schema.isJoi && (schema.body || schema.params || schema.query);

    if (isComposite) {
      const sources = ['body', 'params', 'query'];
      const errors = [];

      for (const src of sources) {
        if (schema[src]) {
          const { error, value } = schema[src].validate(req[src], {
            abortEarly: false,
            stripUnknown: true,
          });

          if (error) {
            errors.push(...error.details.map((detail) => detail.message));
          } else {
            assignValidatedValue(req, src, value);
          }
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validasi gagal',
          errors,
        });
      }

      return next();
    }

    // Single source validation (params, body, atau query)
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validasi gagal',
        errors,
      });
    }

    assignValidatedValue(req, source, value);
    next();
  };
};
