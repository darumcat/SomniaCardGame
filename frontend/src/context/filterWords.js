// Фильтрация текста на запрещённые слова
const filter = new Filter({ placeHolder: '*' });
filter.addWords('плохоеслово', 'другоемат'); // Добавьте свои слова

export const cleanMessage = (text) => {
  try {
    return filter.clean(text); // Заменяет запрещённые слова
  } catch {
    return text; // Возвращает текст как есть в случае ошибки
  }
};
