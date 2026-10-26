// Usage: k6 run -e BASE=https://gave.ph -e CODES=ABC123,DEF456 loadtest/tap.k6.js
// Simulates a launch-day tap storm: ramp to 500 concurrent users following tap -> profile.
import http from "k6/http";
import { check, sleep } from "k6";

const CODES = (__ENV.CODES || "TEST").split(",");
const BASE = __ENV.BASE || "https://gave.ph";

export const options = {
  stages: [
    { duration: "1m", target: 100 },
    { duration: "2m", target: 500 },
    { duration: "1m", target: 500 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1200"],
  },
};

export default function () {
  const code = CODES[Math.floor(Math.random() * CODES.length)];
  const res = http.get(`${BASE}/c/${code}`, { redirects: 5 });
  check(res, { "status 200": (r) => r.status === 200 });
  sleep(1 + Math.random() * 2);
}
