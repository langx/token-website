# [token.langx.io](https://token.langx.io)

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/wm9t.svg)](https://status.langx.io)

Welcome to the LangX Token webpage! Alongside helping you learn a new language through practice and immersion with native speakers around the world, LangX rewards you with tokens for doing it — an in-app point you earn by practising and teaching, and spend on streak freezes and cosmetics. This page explains how that works.

**LangX Token is not a cryptocurrency.** It cannot be bought, sold, traded, staked or withdrawn, it is not on a blockchain, and it does not unlock LangX Pro.

This webpage is built with HTML, CSS and JavaScript — no build step, so what is
in the repository is what ships.

> **Design.** The page uses a scoreboard treatment: `#130900` ground, `#ffc409`
> and `#ff571a` accents, Bungee for display type and Space Mono for everything
> else. It deliberately avoids market imagery — no tickers, no prices, no charts
> that could be read as a traded asset.

> **Social preview.** `images/site-preview.png` (1200×630) is rendered from
> [`tools/og-source.html`](tools/og-source.html). To regenerate it after a copy
> change:
>
> ```bash
> "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --virtual-time-budget=8000 --window-size=1200,630 --screenshot=og@2x.png tools/og-source.html && magick og@2x.png -resize 1200x630 -strip images/site-preview.png
> ```

> **Keeping the numbers honest.** The earning rates, caps, daily pool and item
> prices on this page are published values from the app's own configuration —
> `packages/shared/src/token.ts` (`TOKEN_RULES`) and `cosmetics.ts` in the
> [langx2](https://github.com/langx-io/langx2) repository. If those change, this
> page has to change with them.

## Table of Contents

- [Getting Started](#getting-started)
- [Issues](#issues)
- [Stargazers](#stargazers)
- [Contributors](#contributors)
- [License](#license)

## Setup

### Getting Started

1. Fork the repository to your own GitHub account by clicking the "Fork" button at the top right of the repository page.


2. Clone the repository (Open your terminal and run the following commands).

```bash
# clone the repository
git clone https://github.com/your-username/token-website.git

# Make sure you replace "your-username" with your GitHub username
```

3. Navigate to the project directory

```bash
# navigate to the projects directory
cd token-website
```

## Issues

If you encounter any issues, feel free to open an issue at [langx/token-website/issues](https://github.com/langx/token-website/issues)

## Contributing

We welcome contributions from the community! If you'd like to contribute to the LangX Token webpage, please fork our repository, make some improvements, and submit a pull request. We'll review your changes and merge them if they meet our guidelines. Thank you for helping to make this page even better!

LangX is an open source project and we welcome contributions from the community. If you're interested in contributing, please check out our GitHub repository for more information.

### Stargazers

[![Stargazers over time](https://starchart.cc/langx/token-website.svg?variant=adaptive)](https://starchart.cc/langx/token-website)

### Contributors

[![GitHub Contributor Over Time](https://contributor-overtime-api.git-contributor.com/contributors-svg?chart=contributorOverTime&repo=langx/token-website)](https://git-contributor.com?chart=contributorOverTime&repo=langx/token-website)

[![GitHub Contributors Image](https://contrib.rocks/image?repo=langx/token-website)](https://github.com/langx/token-website/graphs/contributors)

## License

The LangX Token webpage is released under the [BSD 3-Clause "New" or "Revised" License](./LICENSE). If you use this project, please include the license file in your distribution.