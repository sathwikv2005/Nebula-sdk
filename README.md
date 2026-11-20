# Nebula

### Access your sensitive endpoints. Not your passwords.

Nebula is a device-restricted access layer for applications that need to protect sensitive endpoints without putting users through traditional login flows.

Think admin dashboards, internal employee portals, management interfaces, and other endpoints that shouldn't be accessible from just any device.

Instead of asking users to remember another username and password, Nebula establishes trust between an application and an approved device. Once enrolled, the device can authenticate automatically when accessing protected resources.

**No passwords to remember. No login forms to fill out. No sessions for users to manage.**

Just trusted devices accessing the resources they're authorized to use.

---

## Why Nebula?

Traditional authentication answers one question:

_Who are you?_

But for sensitive internal resources, there's another important question:

_Is this an authorized device?_

A valid username and password shouldn't automatically mean that a device deserves access to an internal management interface.

Nebula adds a device-level layer of trust to your application. Access is tied to cryptographically verified devices rather than credentials that users can share, reuse, or accidentally expose.

It is designed to work alongside your existing authentication and authorization systems, not replace them.

## How it works

Nebula is designed around a simple idea: **users shouldn't have to think about authentication every time they use an approved device.**

### 1. Enroll

An administrator temporarily enables device enrollment. A user can then initiate enrollment from their device.

The device establishes its cryptographic identity and requests approval.

### 2. Approve

The administrator reviews the enrollment request and approves the device.

An approved device becomes trusted and can be associated with the appropriate application.

### 3. Access

When the user accesses a protected endpoint, Nebula handles device authentication automatically.

The device proves its identity without requiring the user to enter credentials or manually manage authentication sessions.

### 4. Manage

Administrators retain control over enrolled devices. Devices can be reviewed, managed, and revoked when access is no longer required.

---

## Built for the endpoints that matter

Nebula is particularly useful when an application has resources that should only be accessible from explicitly approved devices.

| Use case                      | What Nebula provides                                           |
| ----------------------------- | -------------------------------------------------------------- |
| Admin dashboards              | Restrict access to approved administrator devices              |
| Employee portals              | Allow access from enrolled employee devices                    |
| Internal management tools     | Prevent unapproved devices from accessing sensitive interfaces |
| Operations dashboards         | Add device-level access control to internal resources          |
| Private application endpoints | Require a trusted device before allowing access                |

Nebula doesn't need to control your entire application. You decide which endpoints require device authentication.

## What makes Nebula different?

**Device-bound identity**

Access is associated with a cryptographic device identity instead of relying on a reusable password.

**Invisible authentication**

Once a device is enrolled and approved, authentication happens in the background. Users don't need to understand tokens, sessions, or login flows.

**Administrator-controlled enrollment**

New devices don't automatically become trusted. Enrollment is controlled by an administrator, who decides which devices are allowed.

**Revocable access**

A device can lose its authorization without requiring changes to every user's credentials.

**Application-level isolation**

Devices are associated with applications, allowing access to be managed within the appropriate application context.

**Developer-controlled protection**

You choose which endpoints require Nebula. Your existing application logic and authorization rules remain yours.

---

## Get started

Install Nebula's Express integration:

```bash
npm install @nebula-sdk/express
```

### Basic integration

Integrating Nebula into an existing Express application takes just a few lines.

```javascript
const express = require('express')
const { Nebula } = require('@nebula-sdk/express')

const app = express()

const nebula = new Nebula({
	uri: process.env.MONGOURI,
	secret: process.env.NEBULA_SECRET,

	admin: {
		username: process.env.NEBULA_ADMIN_USER,
		password: process.env.NEBULA_ADMIN_PASSWORD,
	},
})

// Mount Nebula's internal routes
app.use(nebula.router())

// A regular, publicly accessible endpoint
app.get('/api/public', (req, res) => {
	res.json({ message: 'Hello, world!' })
})

// A device-protected endpoint
app.get('/api/admin/dashboard', nebula.authDevice(), (req, res) => {
	res.json({
		message: 'Welcome to the admin dashboard!',
		device: req.nebula.device,
		application: req.nebula.application,
	})
})

app.listen(3000)
```

That's it.

Nebula handles device authentication before your protected route executes. If the requesting device isn't authorized, the request is rejected.

Your route handler only runs when device authentication succeeds.

### Protecting all routes

If your application is intended to be entirely device-restricted, you can enable global device authentication:

```javascript
const nebula = new Nebula({
	uri: process.env.MONGOURI,
	secret: process.env.NEBULA_SECRET,
	enableDeviceAuthOnAllRoutes: true,
})
```

By default, this option is `false`, allowing you to selectively protect individual endpoints.

### Using your own admin authentication

Nebula also allows you to integrate your existing authentication middleware for protecting the Nebula administrator dashboard.

```javascript
const nebula = new Nebula({
	uri: process.env.MONGOURI,
	secret: process.env.NEBULA_SECRET,
	adminAuth: check_auth,
})
```

This lets you reuse your application's existing administrator authentication instead of configuring separate Nebula administrator credentials.

---

## Nebula is not an authentication replacement

Nebula is not intended to replace your application's existing authentication, user management, or authorization system.

It solves a different problem.

Traditional authentication establishes a user's identity. Authorization determines what that user is allowed to do. Nebula establishes whether the requesting device is trusted.

These mechanisms complement each other.

For example, an employee dashboard might use your existing authentication system to determine which employee is accessing the application, while Nebula ensures that the request originates from an approved device.

This creates an additional layer of protection without introducing another login experience.

---

## Designed for developers

Nebula aims to make device-restricted access straightforward to introduce into existing applications.

Rather than building your own device enrollment workflows, cryptographic challenge-response mechanisms, session handling, and device management infrastructure, you can delegate that responsibility to Nebula.

Your application remains responsible for its business logic, users, and permissions.

Nebula takes care of device trust.

---

## Project Status

Nebula is currently under active development.

The core device enrollment and authentication flow is implemented, with the Express integration and administrator dashboard being developed.

APIs and features may change as the project evolves.

---

## License

Nebula is open-source software released under the MIT License.

---

<p align="center">
  <strong>Nebula</strong>
  <br/>
  <em>Trust the device. Simplify access.</em>
</p>
