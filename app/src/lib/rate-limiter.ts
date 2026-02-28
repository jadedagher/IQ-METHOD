const SESSIONS_PER_HOUR = parseInt(process.env.RATE_LIMIT_SESSIONS_PER_HOUR || '5', 10);
const DAILY_TOKEN_BUDGET = parseInt(process.env.DAILY_TOKEN_BUDGET || '5000000', 10);

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const ipBuckets = new Map<string, Bucket>();
let dailyTokensUsed = 0;
let dailyResetDate = new Date().toDateString();

function getIpBucket(ip: string): Bucket {
  let bucket = ipBuckets.get(ip);
  const now = Date.now();

  if (!bucket) {
    bucket = { tokens: SESSIONS_PER_HOUR, lastRefill: now };
    ipBuckets.set(ip, bucket);
    return bucket;
  }

  // Refill: 1 token per (3600/limit) seconds
  const elapsed = (now - bucket.lastRefill) / 1000;
  const refill = Math.floor(elapsed / (3600 / SESSIONS_PER_HOUR));
  if (refill > 0) {
    bucket.tokens = Math.min(SESSIONS_PER_HOUR, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  return bucket;
}

export function canCreateSession(ip: string): boolean {
  const bucket = getIpBucket(ip);
  return bucket.tokens > 0;
}

export function consumeSessionToken(ip: string): boolean {
  const bucket = getIpBucket(ip);
  if (bucket.tokens <= 0) return false;
  bucket.tokens--;
  return true;
}

export function trackDailyTokens(count: number): boolean {
  // Reset daily counter if new day
  const today = new Date().toDateString();
  if (today !== dailyResetDate) {
    dailyTokensUsed = 0;
    dailyResetDate = today;
  }

  dailyTokensUsed += count;
  return dailyTokensUsed <= DAILY_TOKEN_BUDGET;
}

export function isDailyBudgetExhausted(): boolean {
  const today = new Date().toDateString();
  if (today !== dailyResetDate) {
    dailyTokensUsed = 0;
    dailyResetDate = today;
    return false;
  }
  return dailyTokensUsed >= DAILY_TOKEN_BUDGET;
}
