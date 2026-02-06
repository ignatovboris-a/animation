# Blazor Owl Test

Этот проект предназначен для быстрой проверки интеграции DevOwl Widget в Blazor Server.

## Что подключено

- `wwwroot/js/owl-widget-bundle.js` — собранный JS-бандл виджета.
- `wwwroot/css/owl-widget-bundle.css` — CSS-бандл виджета.
- `Components/OwlWidgetWrapper.razor` — Razor-обертка, которая вызывает JS-монтаж.

## Как обновить бандлы

1. Соберите виджет в корне репозитория:
   ```bash
   npm run build
   ```
2. Скопируйте новые файлы из `dist/` в `wwwroot/js` и `wwwroot/css`.

## Запуск (при наличии SDK)

```bash
dotnet run
```

Откройте `https://localhost:5001` (или URL из вывода) и убедитесь, что сова отображается поверх страницы.
