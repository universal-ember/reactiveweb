import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const footnotes = require('markdown-it-footnote');

export default {
  tsconfig: '../reactiveweb/tsconfig.json',
  markdownItLoader(parser) {
    parser.use(footnotes);
  },
  cleanOutputDir: true,
  compilerOptions: {
    noEmitOnError: false,
  },
  entryPoints: [
    '../reactiveweb/src/*',
    '../reactiveweb/src/resource/service.ts',
    '../reactiveweb/src/resource/modifier/index.ts',
  ],
  navigationLinks: {
    GitHub: 'https://github.com/universal-ember/reactiveweb',
  },
  readme: './README.md',
  exclude: ['../reactiveweb/src/get-promise-state.typetest.ts'],
  out: 'dist',
  emit: 'docs',
  pretty: true,
  skipErrorChecking: true,
  highlightLanguages: [
    'bash',
    'css',
    'html',
    'javascript',
    'typescript',
    'glimmer-js',
    'glimmer-ts',
    'json',
    'jsonc',
  ],
  excludePrivate: true,
  excludeProtected: false,
  excludeExternals: true,
  searchInComments: true,
  disableSources: false,
  categorizeByGroup: false,
  plugin: ['typedoc-github-theme'],
};
