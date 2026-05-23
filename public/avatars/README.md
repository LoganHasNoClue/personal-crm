# Avatars

Drop real profile photos here to replace the gradient-initials fallbacks
on contacts whose `photoUrl` is set to `/avatars/<contact-id>.jpg`.

## How it works

- `src/lib/sample-contacts.ts` sets `photoUrl: localPhoto(id)` for new
  contacts (helper returns `/avatars/<id>.jpg`).
- Next.js serves anything in `public/` at the root path. So a file at
  `public/avatars/c_waris.jpg` is served at `/avatars/c_waris.jpg`.
- If the file is missing, `Avatar.tsx`'s `onError` handler paints the
  contact's gradient initials instead — same energy as the iOS Contacts
  fallback. No code change required.

## Naming convention

`<contact-id>.jpg` — for example `c_waris.jpg`, `c_charlie_lin.jpg`,
`c_jess.jpg`. The contact's `id` field in `sample-contacts.ts` is the
key.

JPG is preferred. PNG and WebP also work — but you'll need to update the
contact's `photoUrl` accordingly (e.g. `/avatars/c_waris.png`).

## Recommended dimensions

- 200×200 px minimum
- Square crop
- Faces centered

The `Avatar` component renders avatars from 28 px (xs) up to 112 px
(2xl), so anything ≥200 px will look sharp on retina displays.

## Quick way to grab a LinkedIn profile photo

1. Open the person's LinkedIn profile in a browser.
2. Right-click their profile photo → **Save Image As…**
3. Save into this folder as `<contact-id>.jpg`.
4. Refresh the app — the new photo will appear automatically.

LinkedIn's CDN URLs are tokenized and expire, so we can't hot-link them
directly — saving the file locally is the cleanest workaround.

## Privacy

This folder is checked into git, so don't drop in photos you don't want
in the repo. If a contact wants to be removed, delete their file here
and the avatar gracefully falls back to initials.
