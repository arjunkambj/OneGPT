export const tabs = [
  {
    value: "preferences",
    label: "Preferences",
    icon: "solar:tuning-2-linear",
  },
  { value: "usage", label: "Usage", icon: "solar:chart-square-linear" },
  {
    value: "subscription",
    label: "Subscription",
    icon: "solar:wallet-money-linear",
  },
].map((item, index) => ({
  ...item,
  number: String(index + 1).padStart(2, "0"),
}));
