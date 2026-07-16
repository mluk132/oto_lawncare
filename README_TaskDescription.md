# OtO React Native Interview Starter

Build a simple dashboard for a customer-facing irrigation app.

## Product Brief

Build a small authenticated irrigation dashboard experience for web. The user
should be able to review their account, inspect devices and zones, and rename a
device from its detail screen.

## Requirements

### Dashboard

- Create a screen for the authenticated user.
- Display the user's name and location at the top of the dashboard.
- List the devices that belong to the user.
- For each device, display the device name and the number of zones it contains.
- Display a loading state while account or device data is being fetched.
- Display an error state if the account or device request fails.

### Device Detail

- Allow the user to open a device detail screen.
- On the device detail screen, display the device information and its zones.

### Rename Device

- Allow the user to edit the device name.
- Save the updated name through the mock API.
- Show a pending state while the request is in progress.
- If the request succeeds, update the UI to reflect the new device name.
- If the request fails, show an appropriate error message or error state.

### Offline Devices

- Some devices may be offline.
- Make it obvious when a device is offline.
- Preserve the offline status in both the dashboard and device detail views.

## Assumptions

- The user is already logged in.
- Authentication is out of scope for this exercise.
- You may assume the account id is already available when loading data.
- Use `account-1` as the current account id.
- Optimize the experience for a mobile portrait layout.

## Provided

- TypeScript support
- Shared data types in `src/models/types.ts`
- A mock `/api` surface that must be called with `fetch`
- Seed data that includes online and offline devices
- Lint, format, and typecheck scripts

## Mock API

The starter includes a mock API for web development. It must be called with
`fetch`.

Available endpoints:

- `GET /api/accounts/:accountId`
- `GET /api/accounts/:accountId/devices`
- `GET /api/devices/:deviceId`
- `GET /api/devices/:deviceId/zones`
- `PATCH /api/devices/:deviceId`

`PATCH /api/devices/:deviceId` expects a JSON body with:

```json
{
  "name": "Front Garden"
}
```

The mock data is shaped like:

- `Account -> Device -> Zone`

The API is normalized around relationships:

- `Account` owns `deviceIds`
- `Device` owns `zoneIds`
- `Zone` belongs to a device
