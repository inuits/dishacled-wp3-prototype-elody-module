import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: './**/*.schema.ts',
  generates: {
    'generated-types/type-defs.ts': {
      plugins: [
        {
          add: {
            content: '// THIS FILE IS GENERATED, DO NOT EDIT!',
          },
        },
        { typescript: {} },
        { 'typescript-resolvers': {} },
      ],
    },
  },
  config: {
    preResolveTypes: true,
    scalars: { Void: 'void' },
    useTypeImports: true,
  },
};

export default config;