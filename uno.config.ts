import { createRemToPxProcessor } from '@unocss/preset-wind4/utils'
import {
  defineConfig,
  presetTypography,
  presetIcons,
  transformerVariantGroup,
  transformerDirectives,
  transformerCompileClass,
} from 'unocss';
import presetWind4 from '@unocss/preset-wind4';
import presetAnimations from 'unocss-preset-animations';
import { presetShadcn } from 'unocss-preset-shadcn';
import presetAutoprefixer from 'unocss-preset-autoprefixer';
import extractorSvelte from '@unocss/extractor-svelte'

// Use 'any' as the generic to resolve the Rule/Theme version mismatch
export default defineConfig<any>({
  presets: [
    presetWind4({
      preflights: {
        theme: {
          mode: 'on-demand',
          process: createRemToPxProcessor(),
        }
      },
    }),
    presetTypography(),
    presetAutoprefixer(),
    presetIcons(),
    presetAnimations(),
    presetShadcn({ color: 'zinc' }),
  ],
  transformers: [
    transformerVariantGroup(),
    transformerCompileClass(),
    transformerDirectives(),
  ],
  extractors: [
    extractorSvelte(),
  ],
  content: {
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|mdx?|html)($|\?)/, 'src*.{js,ts}'],
    },
  },
});
