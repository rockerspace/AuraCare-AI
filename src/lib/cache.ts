const globalThisWithCache = globalThis as typeof globalThis & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __cache: any;
};

if (!globalThisWithCache.__cache) {
  globalThisWithCache.__cache = { latestPatientData: null };
}

export const globalCache = globalThisWithCache.__cache;
