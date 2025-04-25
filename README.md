# Nerd Startpage

Nerd Startpage - стартовая страница браузера, которая не требует использования мыши.

## Фичи

- Отображение категорий в стиле Masonry
- Возможность поиска в Google, Yandex, NPM
- Подсказки от поисковых движков
- Все конфигурация в YAML-файле
- Поиск в истории браузера, закладках, списке недавно закрытых вкладок
- Поиск по сохраненным ссылкам и алиасам на них
- Палитра команд
- Не требует использования мыши
- Настраиваемые горячие клавиши
- Минималистичный
- Использует Nerd Fonts

## Галерея

<p align="center">
  <img src=".github/dashboard.png?raw=true" width="400px" />
  <img src=".github/google-search.png?raw=true" width="400px" />
  <img src=".github/npm-search.png?raw=true" width="400px" />
  <img src=".github/command-palette.png?raw=true" width="400px" />
</p>

## Использование

1. Установите расширение для [Firefox](https://github.com/idefant/nerd-startpage/releases/latest) (`nerd-startpage-*.xpi`)
2. Скачайте [config file](config.yaml)
3. Замените данные на свои
4. Опубликуйте `config.yaml` на Github Gist, Pastebin или любой другой платформе, где можно получить ссылку на `raw` формат.
5. Скопируйте ссылку на `raw` формат (Для примера: https://raw.githubusercontent.com/idefant/nerd-startpage/main/config.yaml)
6. Нажмите комбинацию `Alt + T`, чтобы открыть Nerd Startpage
7. Нажмите комбинацию `CTrl + P`, чтобы открыть палитру команд
8. Выберите команду `Set config URL from clipboard`
9. Перезагрузите конфиг командой `Reload config`

## Горячие клавиши по умолчанию

| Название                           | Комбинация |
| ---------------------------------- | ---------- |
| Открыть Nerd Startpage             | `Alt + T`  |
| Открыть палитру команд             | `Ctrl + P` |
| Поиск в Google                     | `Ctrl + G` |
| Поиск в Yandex                     | `Ctrl + Y` |
| Поиск по истории                   | `Ctrl + H` |
| Поиск по закладкам                 | `Ctrl + B` |
| Поиск по недавно закрытым вкладкам | `Ctrl + S` |
| Поиск по ссылкам и алиасам         | `Ctrl + F` |
| Очистить поле ввода                | `Ctrl + L` |
| Открыть ссылку из буфера обмена    | `Ctrl + O` |

### Навигация по подсказкам

| Название                         | Комбинация     |
| -------------------------------- | -------------- |
| Предыдущая подсказка             | `Arrow Up`     |
| Следующая подсказка              | `Arrow Down`   |
| Скрыть/показать панель подсказок | `Escape`       |
| Открыть ссылку в текущей вкладке | `Enter`        |
| Открыть ссылку в новой вкладке   | `Ctrl + Enter` |

## Продакшн

Mozilla [Developer Hub](https://addons.mozilla.org/en-US/developers/)

```sh
# Сборка проекта
npm run build

# Сборка расширения в zip - только для тестирования в качестве временного расширения на about:debugging#/runtime/this-firefox
web-ext build -s dist

# Сборка и отправка на подпись в Mozilla
npx web-ext sign \
  --api-key=$AMO_JWT_ISSUER \
  --api-secret=$AMO_JWT_SECRET \
  --channel=unlisted \
  --source-dir=dist/ \
  --artifacts-dir=build/
```

## Разработка

```sh
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Запуск Firefox для разработки
npm run firefox

# Запуск витрины компонентов в режиме разработки
npm run storybook

# Запустить все команды разом можно с помощью Taskfile
task dev
```
