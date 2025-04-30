import Filter from 'bad-words';

const filter = new Filter({ placeHolder: '*' });
filter.addWords(...['плохоеслово', 'другоемат']); // Добавьте свои слова

export const cleanMessage = (text) => {
  try {
    return filter.clean(text);
  } catch {
    return text; // Возвращаем как есть в случае ошибки
  }
};