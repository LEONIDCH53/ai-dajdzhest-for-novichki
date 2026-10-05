/* =========================================================
   AI-дайджест — интерактив на главной странице
   1. Появление блоков при прокрутке
   2. Кнопки-фильтры карточек
   3. Счётчики в цифрах
   4. Липкая шапка и кнопка «наверх»
   5. Мобильное меню
   6. Проверка формы подписки
   ========================================================= */

(function () {
    'use strict';

    /* --- 1. Появление блоков при прокрутке ---------------- */

    var revealItems = document.querySelectorAll('.reveal');

    // Если браузер не умеет IntersectionObserver, просто показываем всё
    if (!('IntersectionObserver' in window)) {
        revealItems.forEach(function (item) {
            item.classList.add('is-visible');
        });
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');

                    // Элемент показали — наблюдение больше не нужно
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,   // 12% элемента должно попасть в экран
            rootMargin: '0px 0px -60px 0px'
        });

        revealItems.forEach(function (item) {
            revealObserver.observe(item);
        });
    }

    /* --- 2. Фильтры по темам ----------------------------- */

    var filterButtons = document.querySelectorAll('.filter');
    var cards = document.querySelectorAll('#cards .card');
    var emptyMessage = document.getElementById('cardsEmpty');

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var chosen = button.getAttribute('data-filter');

            // Подсветка активной кнопки
            filterButtons.forEach(function (other) {
                other.classList.remove('is-active');
            });
            button.classList.add('is-active');

            // Показываем нужные карточки
            var visibleCount = 0;

            cards.forEach(function (card) {
                var isMatch = chosen === 'Все' || card.getAttribute('data-tag') === chosen;

                card.classList.toggle('is-hidden', !isMatch);

                if (isMatch) {
                    visibleCount++;
                    // Небольшая задержка, чтобы карточка «выпрыгнула» при появлении
                    card.style.animation = 'none';
                    void card.offsetWidth;           // перезапуск анимации
                    card.style.animation = 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both';
                }
            });

            // Если ничего не нашлось — показываем подсказку
            if (emptyMessage) {
                emptyMessage.hidden = visibleCount > 0;
            }
        });
    });

    /* --- 3. Счётчики в полосе с цифрами ------------------- */

    var counters = document.querySelectorAll('.counter');

    function animateCounter(element) {
        var target = Number(element.getAttribute('data-target')) || 0;
        var duration = 1200;                     // длительность «прокрутки» в мс
        var startTime = null;

        function step(time) {
            // Первый кадр задаёт начальную точку
            if (startTime === null) {
                startTime = time;
            }

            var progress = Math.min((time - startTime) / duration, 1);

            // Плавное замедление в конце
            var eased = 1 - Math.pow(1 - progress, 3);

            element.textContent = Math.round(target * eased);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        }

        window.requestAnimationFrame(step);
    }

    if (counters.length > 0 && 'IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        counters.forEach(function (counter) {
            counterObserver.observe(counter);
        });
    }

    /* --- 4. Липкая шапка и кнопка «наверх» ---------------- */

    var header = document.querySelector('.header');
    var toTopButton = document.getElementById('toTop');

    function onScroll() {
        var scrolled = window.scrollY > 20;

        if (header) {
            header.classList.toggle('is-stuck', scrolled);
        }

        if (toTopButton) {
            toTopButton.classList.toggle('is-visible', window.scrollY > 600);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* --- 5. Мобильное меню ------------------------------- */

    var burger = document.getElementById('burger');
    var nav = document.getElementById('nav');

    if (burger && nav) {
        burger.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('is-open');

            burger.classList.toggle('is-open', isOpen);
            burger.setAttribute('aria-expanded', String(isOpen));
        });

        // Закрываем меню, если кликнули на ссылку
        nav.addEventListener('click', function (event) {
            if (event.target.tagName === 'A') {
                nav.classList.remove('is-open');
                burger.classList.remove('is-open');
                burger.setAttribute('aria-expanded', 'false');
            }
        });

        // Закрываем меню, если кликнули вне него
        document.addEventListener('click', function (event) {
            var clickedInside = nav.contains(event.target) || burger.contains(event.target);

            if (!clickedInside) {
                nav.classList.remove('is-open');
                burger.classList.remove('is-open');
                burger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* --- 6. Проверка формы подписки ----------------------- */

    var subscribeForm = document.getElementById('subscribeForm');
    var emailInput = document.getElementById('email');
    var subscribeHint = document.getElementById('subscribeHint');
    var defaultHint = subscribeHint ? subscribeHint.textContent : '';

    if (subscribeForm && emailInput) {
        subscribeForm.addEventListener('submit', function (event) {
            // Простая проверка прямо в браузере
            var value = emailInput.value.trim();
            var isValid = value.indexOf('@') > 0 && value.indexOf(' ') === -1;

            if (!isValid) {
                // Отправку отменяем, показываем подсказку
                event.preventDefault();

                emailInput.classList.add('is-invalid');
                emailInput.focus();

                if (subscribeHint) {
                    subscribeHint.textContent = 'Проверьте адрес почты — нужен настоящий email.';
                    subscribeHint.classList.add('is-error');
                }
                return;
            }

            // Если всё в порядке — браузер сам отправит форму на сервер
            if (subscribeHint) {
                subscribeHint.textContent = 'Отправляем…';
                subscribeHint.classList.remove('is-error');
            }
        });

        // Убираем красную рамку, как только начали исправлять
        emailInput.addEventListener('input', function () {
            emailInput.classList.remove('is-invalid');

            if (subscribeHint && subscribeHint.classList.contains('is-error')) {
                subscribeHint.textContent = defaultHint;
                subscribeHint.classList.remove('is-error');
            }
        });
    }
})();