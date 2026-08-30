import { z } from "zod";

/**
 * URLs accepted for outbound links and stored Instagram post references.
 * Restricting the scheme here prevents script/data URLs from reaching hrefs
 * or public redirect responses.
 */
export const httpUrlSchema = z.string().url().refine(
  (value) => {
    const protocol = new URL(value).protocol.toLowerCase();
    return protocol === "http:" || protocol === "https:";
  },
  { message: "URL must use the http or https scheme" }
);
