import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'lab-protocol',
  favicon: 'img/favicon.ico',

  // === GitHub Pages 必填：你的用户名 + 站点路径 ===
  url: 'https://violetiiiii.github.io',
  baseUrl: '/lab-protocol/',

  // 这两项用于 npm run deploy
  organizationName: 'Violetiiiii',
  projectName: 'lab-protocol',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  trailingSlash: true,
  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      {
        docs: {
          // 让“文档”出现在站点根路径（即 /lab-protocol/）
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
        // 关闭博客（避免导航栏显示 Blog）
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'lab-protocol',
      logo: { alt: 'logo', src: 'img/logo.svg' },
      items: [
        // 左侧放文档侧边栏入口
        {type: 'doc', docId: 'intro', position: 'left', label: 'Docs'},
      ],
    },
    footer: { style: 'dark' },
  },
};

export default config;
