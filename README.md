# [natey.me](https://natey.me)

My personal website and blog built with [Hugo](https://gohugo.io/) and the [hugo-bearblog](https://github.com/janraasch/hugo-bearblog/) theme, uses [resender](https://github.com/dropalltables/resender) for emails.

## Setup

1. Install Hugo:
```bash
brew install hugo
```

2. Clone this repository with submodules:
```bash
git clone --recurse-submodules https://github.com/dropalltables/natey.git
```

## Development

Run the development server:
```bash
hugo server -D
```

The site will be available at `http://localhost:1313`

## Build

Generate the static site:
```bash
hugo
```

Output will be in the `public/` directory.

## Deployment

This site deploys to Cloudflare Pages using git hooks.

## Email Automation

New blog posts are automatically sent via Resend when pushed to main. Requires GitHub secrets: `RESEND_API_KEY` and `RESEND_SEGMENT_ID`.

## Project Structure

- `content/` - Site content (pages, blog posts)
- `layouts/` - Custom layout overrides
- `static/` - Static assets (images, fonts, CSS)
- `themes/hugo-bearblog/` - Theme submodule
- `hugo.toml` - Site configuration

## License

This project is licensed under the GNU Affero General Public License v3.0

Copyright © 2026, natey hecht
