# CipherSense

CipherSense is a production-quality static cybersecurity web application for real-time password intelligence. It analyzes password strength, entropy, crack-time estimates, patterns, breach exposure, and secure generation without a backend.

## Features

- Real-time password strength score with animated circular gauge
- Entropy and estimated search-space analysis
- Crack-time estimates for consumer hardware, GPUs, clusters, and offline attacks
- Pattern detection for common passwords, dictionary words, sequences, keyboard walks, repeats, and date-like personal information
- Have I Been Pwned password range API integration using browser-side SHA-1 and k-Anonymity
- Secure password generator with length, character class, and ambiguous-character controls
- Dynamic security recommendations with explanations
- Educational expandable cards for password security concepts
- Responsive glassmorphism dashboard with animated grid, particles, neon accents, and accessible focus states
- Theme settings for Dark, Cyber, and High Contrast modes

## Screenshots

Add screenshots after deployment:

- `assets/dashboard.png`
- `assets/generator.png`
- `assets/mobile.png`

## Technology Stack

- HTML5
- CSS3 with variables and responsive layout
- Vanilla JavaScript ES6 modules
- Web Crypto API
- Have I Been Pwned Passwords API
- Lucide Icons CDN

## Installation

No build step is required. Open `index.html` in a browser or serve the folder with any static file server.

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages Deployment

1. Push this repository to GitHub.
2. Open repository settings.
3. Go to Pages.
4. Select the branch that contains `index.html`.
5. Save and wait for GitHub Pages to publish.

## Privacy Model

CipherSense is designed to keep password analysis local:

- Passwords are never stored as plain text.
- Passwords are never logged.
- Strength, entropy, pattern checks, and recommendations run in the browser.
- Theme preference is saved in `localStorage`.
- The local reuse signal stores only a minimal non-secret fingerprint based on password length and edge character codes.

## Have I Been Pwned Integration

The breach checker uses the Have I Been Pwned Passwords API with k-Anonymity:

1. The browser hashes the password locally with SHA-1 using the Web Crypto API.
2. Only the first five characters of the SHA-1 hash are sent to HIBP.
3. HIBP returns matching hash suffixes for that prefix.
4. CipherSense compares suffixes locally.

The app never sends the full password or complete SHA-1 hash.

## Future Improvements

- Add screenshot assets for the README.
- Add optional passphrase generation.
- Add exportable security reports that redact the password.
- Add localization.
- Add automated accessibility tests.

## License

MIT License
