# Add contact (`add-contact`)

## Purpose
Full-page form to create a contact, with a duplicate-email guard. Component: `AddContactPage`. (A lighter `QuickContactModal` exists via the sidebar **+** for fast capture.)

## Entry points
- Contacts "New Contact" button; sidebar **+** → New contact (modal variant); some dashboard/quick actions.

## Components & state
- `AddContactPage({goTo})` — `email` state; `dupModal` boolean; `KNOWN` list of emails that trigger the duplicate dialog. `handleCreate` checks the email against `KNOWN`.

## Step-by-step flow
1. Fill fields (name, email, company, etc.).
2. Create → if email ∈ `KNOWN` → `dupModal` (duplicate found, view/merge) ; else → `goTo('contact-detail')`.

## Limitations
- No real persistence; only the email field drives logic. Created contact isn't added to `CONTACTS_DATA`.

## Suggestions
1. Real create → append to the contacts store and route to the **new** record.
2. Live duplicate detection by email/phone/name with a merge option.
3. Field validation, required-field hints, company autocomplete, owner/tag assignment.
4. "Save & add another" for bulk entry.

## Related
[contacts.md](contacts.md) · [contact-detail.md](contact-detail.md)