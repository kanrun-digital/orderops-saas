export const contactConfig = {
  supportEmail: "support@example.com",
  supportPhone: "",
  telegramBot: "",
  websiteUrl: "",
};
export function getSupportContactEmail() {
  return contactConfig.supportEmail || "support@example.com";
}

export default contactConfig;
