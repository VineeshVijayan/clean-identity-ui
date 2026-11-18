# Onboarding a new client

Canonical copy (full step-by-step for engineering and Super Admin):

**[identity-central-hub/docs/new-client-onboarding.md](../../identity-central-hub/docs/new-client-onboarding.md)**

Summary:

- Give the client a **new database** and a dedicated Hub + UI. IDF is not multi-tenant.
- Sign-in stays local email and password. Directory and HR are sync sources, not SSO.
- Built-in adapters: **Entra** and **Odoo**. Any other directory or HR tool needs a Hub adapter first.
- Super Admin then configures Settings, Connectors, Applications, Company, Blueprints, and people on the **client** URL.
- Set `APP_PUBLIC_URL` to the client UI origin with **no trailing slash** so password-reset mail is not localhost.
