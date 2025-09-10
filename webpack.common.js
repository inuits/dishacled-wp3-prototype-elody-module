const path = require("path");
const {
  GraphQLCodegenWebpackPlugin,
} = require("graphql-codegen-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new GraphQLCodegenWebpackPlugin({ configPath: "./codegen.ts" }),
    new CopyPlugin({
      patterns: [
        {
          from: "./src/translations/locales.json",
          to: "../dist/translations/locales.json",
        },
      ],
    }),
  ],
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader", options: { transpileOnly: true } },
    ],
  },
  output: {
    filename: "server.js",
    path: path.resolve(__dirname, "dist"),
  },
  target: "node",
  resolve: {
    extensions: [".ts", ".js", ".graphql", ".gql", ".json"],
    symlinks: true,
  },
};
