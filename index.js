#!/usr/bin/env node

import Parser from 'rss-parser';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import prompts from 'prompts';
import open from 'open';

const parser = new Parser();

// Topics mapping for Google News RSS
const TOPICS = {
  TOP_STORIES: { name: 'Top Stories', url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en' },
  WORLD: { name: 'World', url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en' },
  BUSINESS: { name: 'Business', url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en' },
  TECHNOLOGY: { name: 'Technology', url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en' },
  SCIENCE: { name: 'Science', url: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en' },
  HEALTH: { name: 'Health', url: 'https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en' },
  SPORTS: { name: 'Sports', url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en' },
  ENTERTAINMENT: { name: 'Entertainment', url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en' }
};

function displayBanner() {
  console.clear();
  const bannerText = chalk.bold.cyan(' G O O G L E   N E W S   C L I ');
  const subtitleText = chalk.dim('Get the latest updates directly in your terminal');
  console.log(
    boxen(`${bannerText}\n${subtitleText}`, {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'cyan',
      float: 'left'
    })
  );
}

async function fetchNews(url) {
  const spinner = ora({
    text: chalk.cyan('Fetching the latest news...'),
    color: 'cyan'
  }).start();

  try {
    const feed = await parser.parseURL(url);
    spinner.succeed(chalk.green('News fetched successfully!'));
    return feed.items;
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch news.'));
    console.error(chalk.red(`Error: ${error.message}`));
    return [];
  }
}

function displayArticles(articles) {
  if (articles.length === 0) {
    console.log(chalk.yellow('\nNo articles found.'));
    return;
  }

  console.log('\n' + chalk.bold.underline.cyan('LATEST HEADLINES:') + '\n');

  articles.forEach((item, index) => {
    // Google News RSS titles usually end with " - Source Name"
    const titleParts = item.title.split(' - ');
    const source = titleParts.pop();
    const title = titleParts.join(' - ');

    const date = new Date(item.pubDate).toLocaleString();

    console.log(
      `${chalk.cyan(`[${index + 1}]`)} ${chalk.bold(title)}`
    );
    console.log(
      `    ${chalk.green('Source:')} ${source} | ${chalk.gray(date)}`
    );
    console.log(`    ${chalk.blue.underline(item.link)}`);
    console.log();
  });
}

async function handleNewsFlow() {
  let currentTopicKey = 'TOP_STORIES';
  let searchQuery = '';
  let articles = [];

  while (true) {
    displayBanner();

    // Category / Search Prompt
    const mainChoices = Object.keys(TOPICS).map(key => ({
      title: TOPICS[key].name,
      value: { type: 'topic', key }
    }));

    mainChoices.push(
      { title: chalk.yellow('🔍 Custom Search...'), value: { type: 'search' } },
      { title: chalk.red('❌ Exit'), value: { type: 'exit' } }
    );

    const mainResponse = await prompts({
      type: 'select',
      name: 'action',
      message: 'Choose a category or action:',
      choices: mainChoices,
      initial: Object.keys(TOPICS).indexOf(currentTopicKey)
    });

    if (!mainResponse.action || mainResponse.action.type === 'exit') {
      console.log(chalk.cyan('\nGoodbye!\n'));
      process.exit(0);
    }

    let fetchUrl = '';
    if (mainResponse.action.type === 'search') {
      const searchResponse = await prompts({
        type: 'text',
        name: 'query',
        message: 'Enter search keyword:',
        validate: val => val.trim().length > 0 ? true : 'Please enter a valid keyword'
      });

      if (!searchResponse.query) continue;
      searchQuery = searchResponse.query;
      fetchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
      currentTopicKey = null; // Clear active topic
    } else {
      currentTopicKey = mainResponse.action.key;
      fetchUrl = TOPICS[currentTopicKey].url;
      searchQuery = '';
    }

    articles = await fetchNews(fetchUrl);
    
    // Limit to top 15 articles to avoid overwhelming the CLI
    const displayedArticles = articles.slice(0, 15);

    while (true) {
      displayBanner();
      const currentLabel = searchQuery 
        ? `Search results for "${searchQuery}"`
        : `${TOPICS[currentTopicKey].name} Headlines`;
      
      console.log(chalk.bold.bgCyan.black(`  ${currentLabel}  `));
      displayArticles(displayedArticles);

      // Next Actions Prompt
      const optionsResponse = await prompts({
        type: 'select',
        name: 'nextAction',
        message: 'What would you like to do next?',
        choices: [
          { title: chalk.cyan('🌐 Open an article in browser'), value: 'open' },
          { title: '🔄 Refresh headlines', value: 'refresh' },
          { title: '📂 Go back to categories', value: 'back' },
          { title: chalk.red('❌ Exit'), value: 'exit' }
        ]
      });

      if (!optionsResponse.nextAction || optionsResponse.nextAction === 'exit') {
        console.log(chalk.cyan('\nGoodbye!\n'));
        process.exit(0);
      }

      if (optionsResponse.nextAction === 'back') {
        break; // Go to main outer loop
      }

      if (optionsResponse.nextAction === 'refresh') {
        articles = await fetchNews(fetchUrl);
        continue;
      }

      if (optionsResponse.nextAction === 'open') {
        if (displayedArticles.length === 0) {
          console.log(chalk.yellow('\nNo articles to open.'));
          await prompts({ type: 'text', name: 'key', message: 'Press Enter to continue...' });
          continue;
        }

        const articleChoices = displayedArticles.map((art, index) => {
          const titleParts = art.title.split(' - ');
          const source = titleParts.pop();
          const title = titleParts.join(' - ');
          return {
            title: `${chalk.cyan(`[${index + 1}]`)} ${title} (${chalk.green(source)})`,
            value: art.link
          };
        });

        const articleSelectResponse = await prompts({
          type: 'select',
          name: 'link',
          message: 'Select an article to open:',
          choices: articleChoices
        });

        if (articleSelectResponse.link) {
          const spinner = ora(chalk.cyan('Opening in browser...')).start();
          try {
            await open(articleSelectResponse.link);
            spinner.succeed(chalk.green('Opened article!'));
          } catch (err) {
            spinner.fail(chalk.red('Failed to open browser.'));
            console.log(chalk.yellow(`Link: ${articleSelectResponse.link}`));
          }
          await prompts({ type: 'text', name: 'key', message: 'Press Enter to return to news list...' });
        }
      }
    }
  }
}

// Start the CLI application
handleNewsFlow().catch(err => {
  console.error(chalk.red('\nAn unexpected error occurred:'));
  console.error(err);
  process.exit(1);
});
