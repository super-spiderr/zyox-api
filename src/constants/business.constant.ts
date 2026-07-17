// Known vertical types. This is a reference list, not an exhaustive/enforced enum -
// Business.verticalType is a free-form string so new verticals can be onboarded
// without a schema change.
export const VerticalType = {
  CATERING: "CATERING",
  BAKERY: "BAKERY",
  BOUTIQUE: "BOUTIQUE",
  SWEET_SHOP: "SWEET_SHOP",
  FLORIST: "FLORIST",
  TIFFIN_SERVICE: "TIFFIN_SERVICE",
} as const;

export const DEFAULT_VERTICAL_TYPE = VerticalType.CATERING;
