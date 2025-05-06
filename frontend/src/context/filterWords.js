import Filter from 'bad-words';

const filter = new Filter({ placeHolder: '*' });

// Добавьте свои запрещенные слова (можно вынести в конфиг)
filter.addWords(
  'мат1', 'мат2', 'мат3' // замените на реальные слова
);

export const cleanMessage = (text) => {
  if (!text || typeof text !== 'string') return '';
  try {
    return filter.clean(text);
  } catch (error) {
    console.error('Filter error:', error);
    return text;
  }
};
