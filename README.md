# GitHub Star Radar

Discover fast-growing open-source repositories using GitHub star history.

## Features

- Daily Star Growth
- Weekly Star Growth
- Monthly Star Growth
- Total Stars sorting
- Growth percentage sorting
- AI category
- Agents category
- Robotics category
- Drone category
- Computer Vision category
- Repository search
- GitHub Star History
- Responsive desktop/mobile UI
- Authenticated GitHub API support

## How Ranking Works

GitHub does not provide an API for globally ranking every repository by stars gained over a period.

GitHub Star Radar therefore:

1. Discovers a candidate pool using GitHub Repository Search.
2. Fetches GitHub Star History for the candidates.
3. Calculates stars gained over 1 / 7 / 30 calendar days.
4. Ranks the candidate pool by stars gained.

Rankings are approximate and are not an exhaustive index of every GitHub repository.

## Metrics

- **Star Growth** — The number of stars gained during the selected 1, 7, or 30-day period.
- **Total Stars** — The repository's current total GitHub star count.
- **Growth %** — Stars gained during the selected period relative to the repository's estimated star count at the start of that period.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- GitHub REST API
- Vercel

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file in the project root:

```dotenv
GITHUB_TOKEN=
```

The token is optional, but authenticated requests receive higher GitHub API rate limits. Never commit `.env.local` or real GitHub tokens.

## API

```http
GET /api/trending
```

Supported query parameters:

```text
period=day|week|month
category=all|ai|agents|robotics|drone|cv
q=
```

Example:

```http
GET /api/trending?period=week&category=ai&q=agent
```

## Limitations

- Rankings are generated from a candidate pool rather than every repository on GitHub.
- GitHub API rate limits apply, especially without authentication.
- GitHub Star History calendar boundaries are approximate.
- Cached upstream data may delay refreshes.

## License

No license has been added to this repository yet.
