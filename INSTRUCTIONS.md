# Инструкция по интеграции DevOwl Widget

Этот виджет разработан как изолированное React-приложение, которое можно "примонтировать" к любому DOM-элементу на существующем сайте.

## Предварительная подготовка (Сборка)

Перед интеграцией необходимо собрать проект.
1. Убедитесь, что установлены зависимости: `npm install`
2. Соберите проект: `npm run build`

В результате вы получите JS-файл (бандл) и CSS-файл (если стили не инлайнятся) в папке `dist` или `build`. Для интеграции нам понадобятся эти файлы.

---

## Вариант 1: Внедрение в обычный HTML/JS сайт

### 1. Подключение ресурсов
Скопируйте собранные JS и CSS файлы в публичную папку вашего сайта.
В `index.html` (или шаблоне вашего сайта) подключите их:

```html
<head>
    <!-- Подключаем стили (Tailwind или собранный CSS) -->
    <link href="/path/to/style.css" rel="stylesheet">
</head>
<body>
    <!-- Ваш контент сайта -->
    
    <!-- Скрипт виджета (лучше в конце body) -->
    <script src="/path/to/owl-widget-bundle.js"></script>
</body>
```

### 2. Создание контейнера
Добавьте пустой `div` с уникальным ID в то место, где должен инициализироваться React. Поскольку `OwlOverlay` использует `position: fixed`, местоположение этого div в структуре DOM не влияет на отображение (сова будет летать поверх всего сайта), но элемент должен существовать.

```html
<div id="owl-widget-root"></div>
```

### 3. Инициализация
Добавьте небольшой скрипт для запуска виджета после загрузки страницы:

```html
<script>
  document.addEventListener("DOMContentLoaded", function() {
    // Проверяем, существует ли глобальная функция mountOwlWidget
    if (window.mountOwlWidget) {
      window.mountOwlWidget('owl-widget-root');
    } else {
      console.error("OwlWidget script not loaded properly.");
    }
  });
</script>
```

---

## Вариант 2: Внедрение в Blazor Server

Blazor Server выполняет рендеринг на сервере, но нам нужно инициализировать клиентский React-компонент. Для этого мы будем использовать `IJSRuntime`.

### 1. Подключение скрипта
В файле `Pages/_Host.cshtml` (для .NET 6/7) или `Components/App.razor` (для .NET 8+) добавьте ссылку на бандл.

```html
<!-- Внутри тега <body>, после скрипта blazor -->
<script src="_framework/blazor.server.js"></script>
<script src="/js/owl-widget-bundle.js"></script> <!-- Укажите правильный путь -->
```

*Примечание: Если вы используете Tailwind CSS, убедитесь, что он также подключен в `head`.*

### 2. Создание Razor-компонента-обертки
Создайте новый файл компонента, например `Components/OwlWidgetWrapper.razor`. Этот компонент будет отвечать за создание контейнера и вызов JS-функции.

```csharp
@inject IJSRuntime JSRuntime
@implements IAsyncDisposable

<!-- Контейнер для React -->
<div id="owl-widget-root"></div>

@code {
    private bool _initialized;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && !_initialized)
        {
            try 
            {
                // Вызываем глобальную функцию, объявленную в index.tsx
                await JSRuntime.InvokeVoidAsync("mountOwlWidget", "owl-widget-root");
                _initialized = true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка запуска OwlWidget: {ex.Message}");
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        // Если бы у нас была функция размонтирования (unmount), мы бы вызвали её здесь.
        // React 18 createRoot требует явного unmount для очистки памяти при удалении компонента.
        // Для глобального виджета это обычно не критично, если он живет все время работы приложения.
    }
}
```

### 3. Добавление в Layout
Чтобы сова была доступна на всех страницах приложения, добавьте компонент в `MainLayout.razor`:

```razor
@inherits LayoutComponentBase

<div class="page">
    <div class="sidebar">
        <NavMenu />
    </div>

    <main>
        @Body
    </main>
</div>

<!-- Добавляем виджет -->
<OwlWidgetWrapper />
```

## Технические детали (index.tsx)

Интеграция работает благодаря этому коду в `index.tsx` вашего React проекта:

```typescript
// @ts-ignore
window.mountOwlWidget = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
        const root = ReactDOM.createRoot(container);
        root.render(
            <React.StrictMode>
                <OwlOverlay />
            </React.StrictMode>
        );
    }
};
```

Это делает функцию `mountOwlWidget` доступной в глобальной области видимости `window`, что позволяет вызывать её из любого места (обычный JS, Blazor, Angular и т.д.).