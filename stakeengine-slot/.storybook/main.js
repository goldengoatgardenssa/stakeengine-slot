/** @type { import('@storybook/html').StorybookConfig } */
const config = {
  stories: ["../src/**/*.stories.js"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/html-webpack5",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
