/**
 * Discount code management for Study Hub
 */

export interface DiscountCode {
    code: string;
    type: "percent" | "free_lifetime";
    value?: number; // percentage amount if type is "percent"
    description: string;
}

const DISCOUNT_CODES: DiscountCode[] = [
    {
        code: "FREE_BETA",
        type: "free_lifetime",
        description: "Beta Tester Lifetime Access",
    },
    {
        code: "LIFETIME",
        type: "free_lifetime",
        description: "Special Lifetime Access Code",
    },
    {
        code: "STUDY_HARD",
        type: "percent",
        value: 50,
        description: "50% Off Monthly/Yearly Subscription",
    },
    {
        code: "WELCOME25",
        type: "percent",
        value: 25,
        description: "25% Welcome Discount",
    },
];

/**
 * Validate a discount code
 */
export function validateDiscountCode(code: string): DiscountCode | null {
    if (!code) return null;

    const normalizedCode = code.trim().toUpperCase();
    return DISCOUNT_CODES.find((c) => c.code === normalizedCode) || null;
}

/**
 * Apply a discount to a price
 */
export function calculateDiscountedPrice(price: number, discount: DiscountCode): number {
    if (discount.type === "free_lifetime") return 0;
    if (discount.type === "percent" && discount.value) {
        return price * (1 - discount.value / 100);
    }
    return price;
}
