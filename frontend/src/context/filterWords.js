// frontend/src/context/filterWords.js
import Filter from 'bad-words'; // Используем ES-импорт

const filter = new Filter({ placeHolder: '*' });
filter.addWords('плохоеслово', 'другоемат');

export const cleanMessage = (text) => {
  try {
    return filter.clean(text);
  } catch {
    return text;
  }
};
