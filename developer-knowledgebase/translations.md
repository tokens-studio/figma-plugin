# Translations

Translations are provided directly within the plugin and are available in `/src/i18n/lang/[language]`

To create a new translation, follow this checklist

1. Create a new folder using the languages [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code
2. Copy the `index.ts` file from  `/src/i18n/lang/en` int your new folder
3. Run `npm run translate`. This should automatically translate the files using google translate. You might encounter errors for obscure languages. You should then take a look at the generated translations to confirm the correctness of the translation
4. Import the file  and add to the `resources` variables using the iso code. 

```ts
const resources = {
  en: {
    translation: enTranslations,
  },
  fr: {
    translation: frTranslations,
  },
  //Add here
}
```

5. Add to the `languages` variable

```ts
export const languages = [{
  title: 'English',
  code: 'en',
},
{
  title: 'French',
  code: 'fr',
},
//Add here
];

```

6. Build the plugin and confirm that the translations are correct