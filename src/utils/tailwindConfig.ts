import tailwindConfigInput from 'tailwind.config';
import { Config } from 'tailwindcss';
import resolveConfig from 'tailwindcss/resolveConfig';

const tailwindConfig = resolveConfig(tailwindConfigInput) as Config & {
  theme: {
    colors: {
      primary: 'var(--color-main-primary)';
      secondary: 'var(--color-main-secondary)';
    };
  };
};

export default tailwindConfig;
