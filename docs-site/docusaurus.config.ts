import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '麻将都Win Docs',
  tagline: '賭博練頭腦🧠',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://ubergoonz.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // Served under the main app's base path, e.g. /mj-dw/docs/
  baseUrl: '/mj-dw/docs/',

  // GitHub pages deployment config.
  organizationName: 'ubergoonz',
  projectName: 'mj-dw',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/ubergoonz/mj-dw/tree/main/docs-site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'mj-dw Docs',
      logo: {
        alt: 'mj-dw Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/category/features',
          position: 'left',
          label: 'Features',
        },
        {
          href: 'https://ubergoonz.github.io/mj-dw/',
          label: 'Open App',
          position: 'right',
        },
        {
          href: 'https://github.com/ubergoonz/mj-dw',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Links',
          items: [
            {
              label: 'App',
              href: 'https://ubergoonz.github.io/mj-dw/',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/ubergoonz/mj-dw',
            },
          ],
        },
      ],
      copyright: `Made with ❤️ by a MJ lover to MJ Community · © ${new Date().getFullYear()} mj-dw`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
