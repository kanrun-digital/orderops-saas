export type AuthProviders = {
  email?: boolean;
  google?: boolean;
  emailOTP?: boolean;
};

export type AuthProvidersResponse = {
  providers?: AuthProviders;
};
