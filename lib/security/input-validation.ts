/**
 * Input validation helpers for production-grade defense.
 */

export function validateSearchInput(input: string): { valid: boolean; error?: string } {
  if (!input || input.trim().length < 2) {
    return { valid: false, error: "Search must be at least 2 characters" };
  }

  if (input.length > 200) {
    return { valid: false, error: "Search query too long" };
  }

  // Prevent obvious NoSQL injection patterns
  const dangerous = /[{}\[\]$]/g;
  if (dangerous.test(input)) {
    return { valid: false, error: "Invalid characters in search" };
  }

  return { valid: true };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Basic: 10+ digits, optional +91 prefix
  const phoneRegex = /^\+?91?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}

export function validatePrice(price: number): boolean {
  return price > 0 && price < 100_000_000; // INR 0 to 10 crore
}

export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
