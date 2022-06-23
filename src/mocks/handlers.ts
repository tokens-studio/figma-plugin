import { rest } from 'msw';

export const LICENSE_FOR_VALID_RESPONSE = 'validate-c421c421-c421c421c-4c21c421-c421c42';
export const LICENSE_FOR_ERROR_RESPONSE = 'validate-error-c421c421-c421c421c421421-41';

export const LICENSE_ERROR_MESSAGE = 'Validate error message';
export const DETACH_ERROR_MESSAGE = 'Detach error message';

export const handlers = [
  rest.get(`${process.env.LICENSE_API_URL}/validate-license`, (req, res, ctx) => {
    const licenseKey = req.url.searchParams.get('licenseKey');

    if (licenseKey === LICENSE_FOR_ERROR_RESPONSE) {
      return res(
        ctx.status(500),
        ctx.json({ message: LICENSE_ERROR_MESSAGE }),
      );
    }
    if (licenseKey === LICENSE_FOR_VALID_RESPONSE) {
      return res(
        ctx.status(200),
        ctx.json({
          plan: 'pro',
          entitlements: 'pro',
          email: 'test@email.com',
        }),
      );
    }

    return res();
  }),

  rest.put(`${process.env.LICENSE_API_URL}/detach-license`, (req, res, ctx) => {
    const { licenseKey } = req.body as { licenseKey: string };
    if (licenseKey === LICENSE_FOR_ERROR_RESPONSE) {
      return res(
        ctx.status(500),
        ctx.json({ message: DETACH_ERROR_MESSAGE }),
      );
    }
    if (licenseKey === LICENSE_FOR_VALID_RESPONSE) {
      return res(
        ctx.status(200),
        ctx.json({
          key: LICENSE_FOR_VALID_RESPONSE,
        }),
      );
    }
    return res();
  }),

];
