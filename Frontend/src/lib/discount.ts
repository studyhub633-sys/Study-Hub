/**
 * Discount code management for Revisely.ai
 */

export interface DiscountCode {
    code: string;
    type: "percent";
    value: number; // percentage amount
    description: string;
}

const DISCOUNT_CODES: DiscountCode[] = [
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
    {
        code: "PUBE20",
        type: "percent",
        value: 20,
        description: "20% Off Subscription",
    },
    {
        code: "FRANQ20",
        type: "percent",
        value: 20,
        description: "20% Off Subscription",
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
    if (discount.type === "percent" && discount.value) {
        return price * (1 - discount.value / 100);
    }
    return price;
}
