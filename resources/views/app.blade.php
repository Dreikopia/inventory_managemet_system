<!DOCTYPE html>

<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <script>
        (function () {
            const storageKey = 'aircare-theme';
            let theme = null;

            try {
                theme = localStorage.getItem(storageKey);
            } catch (error) {
                theme = null;
            }

            if (theme !== 'light' && theme !== 'dark') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            const root = document.documentElement;

            root.classList.toggle('dark', theme === 'dark');
            root.style.colorScheme = theme;
        })();
    </script>

    @viteReactRefresh
    @vite('resources/js/app.jsx')
    @inertiaHead

</head>

<body>
    @inertia
</body>

</html>
