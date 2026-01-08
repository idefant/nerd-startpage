# Nerd Startpage

Nerd Startpage - стартовая страница браузера для нёрдов.

- Минимализм
- Не требует использования мыши
- Подсказки от поисковых движков
- Вся конфигурация в [YAML-файле](./config.yaml)
- Настраиваемые горячие клавиши и leader последовательности
- Поддерживает иконки [Nerd Fonts](https://www.nerdfonts.com/cheat-sheet)
- Доступно для Firefox и Chrome

## Режимы

- Поиск в Google
- Поиск в Yandex
- Поиск в NPM
- Поиск в истории браузера
- Поиск в закладках в браузере
- Недавно закрытые вкладки
- Поиск по ссылкам и алиасам в Nerd Startpage
- Палитра команд

## Галерея

<p align="center">
  <img src=".github/dashboard.png?raw=true" width="400px" />
  <img src=".github/google-search.png?raw=true" width="400px" />
  <img src=".github/npm-search.png?raw=true" width="400px" />
  <img src=".github/command-palette.png?raw=true" width="400px" />
</p>

## Установка

- для [Firefox](https://github.com/idefant/nerd-startpage/releases/latest) (`nerd-startpage-firefox-*.xpi`)
- для [Chrome](https://github.com/idefant/nerd-startpage/releases/latest) (`nerd-startpage-chrome-*.zip`)

## Использование

1. Скачайте [config.yaml](./config.yaml)
2. Ознакомьтесь с документацией внутри `config.yaml` и настройте Nerd Startpage под себя, раскомментировав необходимые строки
3. Опубликуйте `config.yaml` на Github Gist, Pastebin или любой другой платформе, где можно получить ссылку на `raw` формат
4. Скопируйте ссылку на `raw` формат (Для примера: https://raw.githubusercontent.com/idefant/nerd-startpage/main/config.yaml)
5. Нажмите комбинацию `Alt + T`, чтобы открыть Nerd Startpage
6. Откройте палитру команд с помощью `Ctrl + P`
7. Выберите команду `Set config URL from clipboard`
8. После обновления конфига подтягивайте изменения командой `Reload config`

## Горячие клавиши

### Горячие клавиши по умолчанию

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

### Навигация по подсказкам

| Название                                                                    | Комбинация           |
| --------------------------------------------------------------------------- | -------------------- |
| Предыдущая подсказка                                                        | `Arrow Up`           |
| Следующая подсказка                                                         | `Arrow Down`         |
| Скрыть/показать панель подсказок                                            | `Escape`             |
| Открыть ссылку в текущей вкладке                                            | `Enter`              |
| Открыть ссылку в новой вкладке                                              | `Ctrl + Enter`       |
| Открыть альтернативный сайт (только NPM -> BundlePhobia)                    | `Alt + Enter`        |
| Открыть альтернативный сайт в новой вкладке                                 | `Ctrl + Alt + Enter` |
| Применить подсказку и продолжить ввод (только режимы Google и Yandex)       | `Tab`                |
| Отредактировать URL подсказки (только режимы поиска по истории и закладкам) | `Ctrl + E`           |

## Продакшн сборка

### Firefox

Mozilla [Developer Hub](https://addons.mozilla.org/en-US/developers/)

```sh
# Сборка проекта
task build-firefox

# Сборка расширения в zip - только для тестирования в качестве временного расширения на about:debugging#/runtime/this-firefox
web-ext build -s dist-firefox

# Сборка и отправка на подпись в Mozilla
web-ext sign \
  --api-key=$AMO_JWT_ISSUER \
  --api-secret=$AMO_JWT_SECRET \
  --channel=unlisted \
  --source-dir=dist-firefox/ \
  --artifacts-dir=build-firefox/
```

### Chrome

```sh
task build-chrome
```

Результат в папке `./dist-chrome`

## Разработка

```sh
# Установка зависимостей
npm install

# Запуск Firefox для разработки
task dev-firefox

# Запуск Chrome для разработки
task dev-chrome

# Запуск витрины компонентов в режиме разработки
npm run storybook
```

## Технические особенности

### Манифест

Chrome и Firefox требуют манифеста в разных форматах. Необходимый манифест устанавливается автоматически при запуске `task dev-firefox` или `task dev-chrome`.
