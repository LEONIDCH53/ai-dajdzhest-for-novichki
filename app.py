"""
AI-дайджест для новичков — конверсионный сайт на Flask.

Запуск:
    pip install -r requirements.txt
    python app.py

Сайт откроется по адресу: http://127.0.0.1:5000
"""

from flask import Flask, render_template, request, redirect, url_for, flash, abort

# Все тексты и карточки лежат в файле data.py — меняйте контент там.
from data import (
    MATERIALS,
    CATEGORIES,
    BENEFITS,
    FAQ,
    REVIEWS,
    STATS,
)

app = Flask(__name__)

# Ключ нужен, чтобы показывать сообщения (flash) между страницами.
# В настоящем проекте задайте его через переменную окружения.
app.secret_key = "dev-secret-key-for-flash-messages"


# --- Вспомогательные функции ---------------------------------------------

def find_material(slug):
    """Ищет материал по slug. Возвращает словарь или None."""
    for material in MATERIALS:
        if material["slug"] == slug:
            return material
    return None


def neighbors(slug):
    """Возвращает предыдущий и следующий материал (для навигации внизу страницы)."""
    index = -1
    for i, material in enumerate(MATERIALS):
        if material["slug"] == slug:
            index = i
            break

    prev_material = MATERIALS[index - 1] if index > 0 else None
    next_material = MATERIALS[index + 1] if index + 1 < len(MATERIALS) else None
    return prev_material, next_material


# --- Страницы -------------------------------------------------------------

@app.route("/")
def index():
    """Главная страница: герой, карточки, преимущества, отзывы, FAQ и форма."""
    return render_template(
        "index.html",
        materials=MATERIALS,
        categories=CATEGORIES,
        benefits=BENEFITS,
        faq=FAQ,
        reviews=REVIEWS,
        stats=STATS,
    )


@app.route("/material/<slug>")
def material(slug):
    """Страница одного материала."""
    current = find_material(slug)
    if current is None:
        # Такой страницы нет — показываем красивую страницу 404
        abort(404)

    prev_material, next_material = neighbors(slug)

    # Карточка «По теме рядом»: ещё три материала того же тега.
    same_tag = [
        m for m in MATERIALS
        if m["tag"] == current["tag"] and m["slug"] != slug
    ][:3]

    return render_template(
        "material.html",
        item=current,
        prev_material=prev_material,
        next_material=next_material,
        same_tag=same_tag,
    )


@app.route("/subscribe", methods=["POST"])
def subscribe():
    """Приём email из формы. Письма не уходят наружу — показываем сообщение."""
    email = request.form.get("email", "").strip()

    # Простая проверка: строка должна содержать @ и пробелов.
    if "@" not in email or " " in email or len(email) < 6:
        flash("Похоже, в email есть опечатка. Проверьте адрес и попробуйте ещё раз.", "error")
        return redirect(url_for("index") + "#subscribe")

    # Здесь в настоящем проекте можно подключить отправку письма или базу данных.
    print(f"Новая подписка: {email}")

    flash("Готово! Первый дайджест придёт на вашу почту.", "success")
    return redirect(url_for("index") + "#subscribe")


@app.errorhandler(404)
def page_not_found(error):
    """Своя страница 404 в стиле сайта."""
    return render_template("404.html", materials=MATERIALS), 404


if __name__ == "__main__":
    # debug=True — перезагрузка страницы при сохранении файла (удобно в разработке)
    app.run(debug=True, host="127.0.0.1", port=5000)