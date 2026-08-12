const globalThisWithCache = globalThis as typeof globalThis & {
  __cache: any;
};

if (!globalThisWithCache.__cache) {
  globalThisWithCache.__cache = { latestPatientData: null };
}

export const globalCache = globalThisWithCache.__cache;
