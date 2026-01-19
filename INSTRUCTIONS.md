# Инструкция по интеграции DevOwl Widget

Этот виджет разработан как изолированное React-приложение, которое можно "примонтировать" к любому DOM-элементу на существующем сайте.

## Предварительная подготовка (Сборка)

Перед интеграцией необходимо собрать проект.
1. Убедитесь, что установлены зависимости: `npm install`
2. Соберите проект: `npm run build`

В результате вы получите JS-файл (бандл) и CSS-файл в папке `dist`. Для интеграции нам понадобятся эти файлы.

---

## Вариант 1: Внедрение в обычный HTML/JS сайт

### 1. Подключение ресурсов
Скопируйте собранные JS и CSS файлы в публичную папку вашего сайта.
В `index.html` (или шаблоне вашего сайта) подключите их:

```html
<head>
    <!-- Подключаем стили виджета (включая Tailwind) -->
    <link href="/path/to/owl-widget-bundle.css" rel="stylesheet">
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

*Примечание: Tailwind уже собран в `owl-widget-bundle.css`, подключать CDN не нужно.*

### 2. Создание Razor-компонента-обертки
Создайте новый файл компонента, например `Components/OwlWidgetWrapper.razor`. Этот компонент будет отвечать за создание контейнера и вызов JS-функции.

```csharp
@inject IJSRuntime JSRuntime
@implements IAsyncDisposable

<!-- Контейнер для React -->
<div id="owl-widget-root"></div>

@code {
    private bool _initialized;

    [Parameter]
    public double Scale { get; set; } = 0.8;

    [Parameter]
    public int StartXPercent { get; set; } = 90;

    [Parameter]
    public int StartYPercent { get; set; } = 90;

    [Parameter]
    public bool AutoSpawn { get; set; } = false;

    [Parameter]
    public double MinSpawnSeconds { get; set; } = 60;

    [Parameter]
    public double MaxSpawnSeconds { get; set; } = 300;

    [Parameter]
    public bool EnableControls { get; set; } = true;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && !_initialized)
        {
            try
            {
                // Вызываем глобальную функцию, объявленную в index.tsx
                await JSRuntime.InvokeVoidAsync("mcp.mountOwlWidget", "owl-widget-root", new
                {
                    scale = Scale,
                    startXPercent = StartXPercent,
                    startYPercent = StartYPercent,
                    autoSpawn = AutoSpawn,
                    minSpawnSeconds = MinSpawnSeconds,
                    maxSpawnSeconds = MaxSpawnSeconds,
                    controlsEnabled = EnableControls
                });
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
    <OwlWidgetWrapper @rendermode="new InteractiveServerRenderMode()"
                      Scale="0.8"
                      StartXPercent="20"
                      StartYPercent="20"
                      AutoSpawn="true"
                      MinSpawnSeconds="120"
                      MaxSpawnSeconds="300"
                      EnableControls="false" />
```



## Технические детали (site.js)

Интеграция работает благодаря этому коду

```typescript

window.mcp.mountOwlWidget = (containerId, options) => {
    const config = {
        scale: typeof options?.scale === "number" ? options.scale : 0.8,
        startXPercent: typeof options?.startXPercent === "number" ? options.startXPercent : 90,
        startYPercent: typeof options?.startYPercent === "number" ? options.startYPercent : 90,
        autoSpawn: typeof options?.autoSpawn === "boolean" ? options.autoSpawn : false,
        minSpawnSeconds: typeof options?.minSpawnSeconds === "number" ? options.minSpawnSeconds : 60,
        maxSpawnSeconds: typeof options?.maxSpawnSeconds === "number" ? options.maxSpawnSeconds : 300,
        controlsEnabled: typeof options?.controlsEnabled === "boolean" ? options.controlsEnabled : true
    };

    console.info("OwlWidget: requested mount", { containerId, config });

    const startTime = performance.now();
    const timeoutMs = 10000;

    const waitForMount = () => {
        if (typeof window.mountOwlWidget === "function") {
            const container = document.getElementById(containerId);
            console.info("OwlWidget: mount function available", { containerFound: Boolean(container) });
            window.mountOwlWidget(containerId, config);
            return;
        }

        if (performance.now() - startTime < timeoutMs) {
            setTimeout(waitForMount, 100);
            return;
        }

        console.warn("OwlWidget: mountOwlWidget is not available after waiting.", { containerId });
    };

    waitForMount();
};
```

Это делает функцию `mountOwlWidget` доступной в глобальной области видимости `window`, что позволяет вызывать её из любого места (обычный JS, Blazor, Angular и т.д.).
