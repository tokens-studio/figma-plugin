import { rest } from 'msw';

export const LICENSE_FOR_VALID_RESPONSE = 'validate-c421c421-c421c421c-4c21c421-c421c42';
export const LICENSE_FOR_ERROR_RESPONSE = 'validate-error-c421c421-c421c421c421421-41';
export const LICENSE_FOR_DETACH_ERROR_RESPONSE = 'detach-error-c421c421-c421c421c421421-41';

export const USER_ID_FOR_FOUND_LICENSE_KEY = 'pro-user-id';
export const USER_ID_FOR_NOT_FOUND_LICENSE_KEY = 'free-user-id';

export const LICENSE_ERROR_MESSAGE = 'Validate error message';
export const DETACH_ERROR_MESSAGE = 'Detach error message';

export const mockGetLicenseHandler = jest.fn((req, res, ctx) => {
  const userId = req.url.searchParams.get('userId');

  if (userId === USER_ID_FOR_FOUND_LICENSE_KEY) {
    return res(ctx.status(200), ctx.json({ key: LICENSE_FOR_VALID_RESPONSE }));
  }

  return res(ctx.status(404), ctx.json({ message: 'No license key found' }));
});

export const mockValidateLicenseHandler = jest.fn((req, res, ctx) => {
  const licenseKey = req.url.searchParams.get('licenseKey');

  if (licenseKey === LICENSE_FOR_ERROR_RESPONSE) {
    return res(ctx.status(500), ctx.json({ message: LICENSE_ERROR_MESSAGE }));
  }
  return res(
    ctx.status(200),
    ctx.json({
      plan: 'pro',
      entitlements: 'pro',
      email: 'test@email.com',
    }),
  );
});

export const mockDetachLicenseHandler = jest.fn((req, res, ctx) => {
  const { licenseKey } = req.body as { licenseKey: string };
  if (licenseKey === LICENSE_FOR_DETACH_ERROR_RESPONSE) {
    return res(ctx.status(500), ctx.json({ message: DETACH_ERROR_MESSAGE }));
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
});

export const handlers = [
  rest.get(`${process.env.LICENSE_API_URL}/get-license`, mockGetLicenseHandler),

  rest.get(`${process.env.LICENSE_API_URL}/validate-license`, mockValidateLicenseHandler),

  rest.put(`${process.env.LICENSE_API_URL}/detach-license`, mockDetachLicenseHandler),

  rest.post(`${process.env.TOKEN_FLOW_APP_URL}/api/tokens`, (req, res, ctx) => res(ctx.status(200), ctx.json({ result: 'test-id' }))),
];
