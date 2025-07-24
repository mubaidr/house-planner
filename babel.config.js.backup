module.exports = {
  presets: [
    ['@babel/preset-env', { 
      targets: { node: 'current' },
      modules: 'commonjs'
    }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { 
      runtime: 'automatic'
    }],
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { 
          targets: { node: 'current' },
          modules: 'commonjs'
        }],
        '@babel/preset-typescript',
        ['@babel/preset-react', { 
          runtime: 'automatic'
        }],
      ],
    },
  },
};