import { Redis } from "@upstash/redis";

let client: Redis | null = null;

/**
 * Retourne null tant que KV_REST_API_URL/KV_REST_API_TOKEN ne sont pas configurés.
 * Base partagée avec clk-site — toutes les clés utilisées ici sont préfixées "lapd:"
 * pour ne jamais entrer en collision avec les données de l'autre site.
 */
export function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  if (!client) client = new Redis({ url, token });
  return client;
}
