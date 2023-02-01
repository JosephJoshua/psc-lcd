module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      [
        'module-resolver',
        {
          alias: {
            '@/lib': './src/lib',
            '@/navigation': './src/navigation',
            '@/screens': './src/screens',
            '@/components': './src/components',
            '@/hooks': './src/hooks',
            '@/utils': './src/utils',
            'tailwind.config': './tailwind.config',
          },
        },
      ],
    ],
  };
};
