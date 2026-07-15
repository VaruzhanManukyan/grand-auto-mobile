/**
 * utils/simulate-latency.ts
 *
 * Shared by every *.service.types.ts while they resolve from mocks, so
 * loading states behave the same way they will once each method
 * body becomes a real api.get(...) call.
 */
export const simulateLatency = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));