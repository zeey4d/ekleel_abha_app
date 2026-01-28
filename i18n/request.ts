import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import fs from 'fs';
import path from 'path';

export default getRequestConfig(async ({ requestLocale }: any) => {
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale;
  }

  const messages: Record<string, any> = {};
  const messagesDir = path.resolve(process.cwd(), 'messages', locale);

  try {
    if (fs.existsSync(messagesDir)) {
      const files = fs.readdirSync(messagesDir);
      files.forEach((file) => {
        if (path.extname(file) === '.json') {
          const key = path.basename(file, '.json');
          const filePath = path.join(messagesDir, file);
          try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            messages[key] = JSON.parse(fileContent);
          } catch (fileError) {
            console.error(`Error loading message file ${file}:`, fileError);
          }
        }
      });
    } else {
      // Fallback to the single file if the directory doesn't exist
      // This is useful during migration or if the structure reverts
      const singleFileMessages = (await import(`../messages/${locale}.json`)).default;
      Object.assign(messages, singleFileMessages);
    }
  } catch (error) {
    console.error(`Error loading messages for locale "${locale}":`, error);
  }

  return {
    locale,
    messages,
  };
});
