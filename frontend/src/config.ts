export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

if (!API_BASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_API_URL in environment variables.');
}
