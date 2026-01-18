# Blazor Server test project for DevOwl

Этот проект предназначен для проверки интеграции React-виджета "сова" в Blazor Server.

## Быстрый запуск

1. Сначала соберите виджет в корне репозитория:
   ```bash
   npm install
   npm run build
   ```
2. Скопируйте собранные файлы в Blazor-проект:
   ```bash
   cp dist/owl-widget-bundle.js blazor-owl-test/wwwroot/js/owl-widget-bundle.js
   cp dist/owl-widget-bundle.css blazor-owl-test/wwwroot/css/owl-widget-bundle.css
   ```
3. Запустите Blazor Server:
   ```bash
   dotnet run --project blazor-owl-test
   ```

## Где подключается виджет

- Скрипты и стили добавлены в `Components/App.razor`.
- Инициализация выполняется через `Components/OwlWidgetWrapper.razor` и `wwwroot/js/site.js`.
- Компонент подключен в `Components/Layout/MainLayout.razor`.
