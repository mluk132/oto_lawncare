export type MockApiConfig = {
  artificialDelayMs: number;
  extraArtificialDelayMs: number;
  forceUpdateDeviceError: boolean;
};

// Central toggles for driving interview/demo scenarios without touching the
// mock request handlers themselves.
export const mockApiConfig: MockApiConfig = {
  artificialDelayMs: 600,
  extraArtificialDelayMs: 0,
  forceUpdateDeviceError: false,
};
