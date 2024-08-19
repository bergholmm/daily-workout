/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: [
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports',
  ],
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  importOrder: [
    'server-only',
    '<THIRD_PARTY_MODULES>',
    '^~/app/(.*)$',
    '^~/server/(.*)$',
    '^~/components/(.*)$',
    '^~/lib/(.*)$',
    '^~/styles/(.*)$',
    '^~/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}

export default config
