# Google News CLI

A premium, interactive command-line interface (CLI) application built with Node.js to fetch, search, and read the latest news from Google News.

## Features

- 🌐 **Latest Headlines**: Instantly fetch top stories or browse by categories.
- 📂 **Category Selector**: Navigate categories using your arrow keys (World, Business, Technology, Science, Health, Sports, Entertainment).
- 🔍 **Custom Search**: Search Google News for any keyword or phrase.
- ⚡ **Open in Browser**: Select any article directly in the terminal and launch it in your default web browser.
- 🎨 **Sleek Aesthetics**: Beautiful terminal styling, cards, and smooth loading spinners.

---

## Prerequisites

- **Node.js** (version 18 or higher recommended)
- **npm** (comes packaged with Node.js)

---

## Installation

Clone the repository or navigate to your local project directory, then run:

```bash
# Install dependencies
npm install
```

### Optional: Global CLI Link
You can link the command globally so that you can run it from any directory in your terminal:

```bash
# Link the CLI
npm link
```

---

## Usage

If you linked the application globally, simply run:

```bash
google-news
```

Otherwise, run it locally via Node:

```bash
node index.js
```

---

## Tech Stack

This CLI is built using the following libraries:
- **[rss-parser](https://www.npmjs.com/package/rss-parser)**: To fetch and parse Google News feeds.
- **[prompts](https://www.npmjs.com/package/prompts)**: For arrow-key navigation and search inputs.
- **[chalk](https://www.npmjs.com/package/chalk)**: For high-fidelity terminal text colors.
- **[boxen](https://www.npmjs.com/package/boxen)**: For clean visual cards and layout panels.
- **[ora](https://www.npmjs.com/package/ora)**: For elegant CLI loading animations.
- **[open](https://www.npmjs.com/package/open)**: To launch browser windows from Node.
