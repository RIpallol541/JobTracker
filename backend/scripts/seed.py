"""Демо-данные для первого запуска. Если пользователь demo@example.com уже есть — выходим (идемпотентно)."""

from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select

from app.core.security import hash_password
from app.db.models import (
    Application,
    ApplicationStatus,
    Interview,
    InterviewFormat,
    Note,
    Offer,
    OfferStatus,
    RemoteFormat,
    User,
    Vacancy,
    WorkFormat,
)
from app.db.session import get_session_local


def seed() -> None:
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        if db.execute(select(User).where(User.email == "demo@example.com")).scalar_one_or_none():
            return

        user = User(email="demo@example.com", password_hash=hash_password("DemoPass123!"))
        db.add(user)
        db.flush()

        now = datetime.now(timezone.utc)

        vac_specs: list[dict] = [
            {
                "title": "Python-разработчик (бэкенд)",
                "company": "ООО «Северный код»",
                "link": "https://example.com/jobs/north-backend",
                "description": "FastAPI, PostgreSQL, очереди. Продуктовая команда.",
                "salary_min": 180_000,
                "salary_max": 260_000,
                "currency": "RUB",
                "location": "Москва",
                "work_format": WorkFormat.remote,
            },
            {
                "title": "Fullstack-инженер",
                "company": "Кедр Лабс",
                "link": "https://example.com/jobs/cedar-fs",
                "description": "React, Node.js, TypeScript.",
                "salary_min": 200_000,
                "salary_max": 290_000,
                "currency": "RUB",
                "location": "Санкт-Петербург",
                "work_format": WorkFormat.hybrid,
            },
            {
                "title": "Python-разработчик (данные)",
                "company": "Риверстоун Тех",
                "link": "https://example.com/jobs/river-py",
                "description": "Пайплайны, внутренние сервисы, Airflow.",
                "salary_min": 150_000,
                "salary_max": 210_000,
                "currency": "RUB",
                "location": "Казань",
                "work_format": WorkFormat.office,
            },
            {
                "title": "Senior Software Engineer",
                "company": "Саммит Аналитика",
                "link": "https://example.com/jobs/summit-senior",
                "description": "Высокие нагрузки, микросервисы, Kafka.",
                "salary_min": 320_000,
                "salary_max": 450_000,
                "currency": "RUB",
                "location": "Москва",
                "work_format": WorkFormat.remote,
            },
            {
                "title": "Middle-разработчик",
                "company": "Брайт Харбор",
                "link": "https://example.com/jobs/bright-mid",
                "description": "Фичи, ревью, релизы каждые две недели.",
                "salary_min": 170_000,
                "salary_max": 230_000,
                "currency": "RUB",
                "location": "Удалённо",
                "work_format": WorkFormat.hybrid,
            },
            {
                "title": "Go-разработчик",
                "company": "Гранит Софт",
                "link": "https://example.com/jobs/granite-go",
                "description": "Микросервисы, gRPC, Kubernetes.",
                "salary_min": 220_000,
                "salary_max": 310_000,
                "currency": "RUB",
                "location": "Екатеринбург",
                "work_format": WorkFormat.hybrid,
            },
            {
                "title": "Frontend (React)",
                "company": "Лайтвейв",
                "link": "https://example.com/jobs/lightwave-fe",
                "description": "Дизайн-система, Storybook, accessibility.",
                "salary_min": 160_000,
                "salary_max": 240_000,
                "currency": "RUB",
                "location": "Санкт-Петербург",
                "work_format": WorkFormat.remote,
            },
            {
                "title": "DevOps-инженер",
                "company": "ОблакоПро",
                "link": "https://example.com/jobs/cloudpro-devops",
                "description": "AWS/GCP, Terraform, CI/CD.",
                "salary_min": 240_000,
                "salary_max": 350_000,
                "currency": "RUB",
                "location": "Москва",
                "work_format": WorkFormat.office,
            },
            {
                "title": "ML-инженер",
                "company": "НейроЛаб",
                "link": "https://example.com/jobs/neurolab-ml",
                "description": "PyTorch, продакшен-модели, мониторинг.",
                "salary_min": 280_000,
                "salary_max": 400_000,
                "currency": "RUB",
                "location": "Москва",
                "work_format": WorkFormat.hybrid,
            },
            {
                "title": "Инженер по безопасности (AppSec)",
                "company": "Щит Секьюрити",
                "link": "https://example.com/jobs/shield-appsec",
                "description": "SAST/DAST, threat modeling.",
                "salary_min": 250_000,
                "salary_max": 380_000,
                "currency": "RUB",
                "location": "Удалённо",
                "work_format": WorkFormat.remote,
            },
            {
                "title": "Android-разработчик",
                "company": "МобиСтарт",
                "link": "https://example.com/jobs/mobistart-android",
                "description": "Kotlin, Compose, крупное B2C-приложение.",
                "salary_min": 190_000,
                "salary_max": 270_000,
                "currency": "RUB",
                "location": "Казань",
                "work_format": WorkFormat.hybrid,
            },
            {
                "title": "Системный аналитик",
                "company": "Интегра Плюс",
                "link": "https://example.com/jobs/integra-ba",
                "description": "Банковский сектор, требования, UML.",
                "salary_min": 200_000,
                "salary_max": 280_000,
                "currency": "RUB",
                "location": "Москва",
                "work_format": WorkFormat.office,
            },
            {
                "title": "QA Automation",
                "company": "ТестЛайн",
                "link": "https://example.com/jobs/testline-qa",
                "description": "Python, Playwright, API-тесты.",
                "salary_min": 140_000,
                "salary_max": 200_000,
                "currency": "RUB",
                "location": "Нижний Новгород",
                "work_format": WorkFormat.remote,
            },
            {
                "title": "Tech Lead (Python)",
                "company": "ФинТех Холдинг",
                "link": "https://example.com/jobs/fintech-tl",
                "description": "Команда 6 человек, платёжные сервисы.",
                "salary_min": 350_000,
                "salary_max": 480_000,
                "currency": "RUB",
                "location": "Москва",
                "work_format": WorkFormat.hybrid,
            },
            {
                "title": "Rust-разработчик",
                "company": "Низкоуровневые системы",
                "link": "https://example.com/jobs/lowlevel-rust",
                "description": "Высокопроизводительные парсеры, SIMD.",
                "salary_min": 260_000,
                "salary_max": 360_000,
                "currency": "RUB",
                "location": "Удалённо",
                "work_format": WorkFormat.remote,
            },
            {
                "title": "Инженер данных",
                "company": "ДатаРека",
                "link": "https://example.com/jobs/datariver-de",
                "description": "dbt, Snowflake, оркестрация.",
                "salary_min": 210_000,
                "salary_max": 300_000,
                "currency": "RUB",
                "location": "Санкт-Петербург",
                "work_format": WorkFormat.hybrid,
            },
        ]

        vacs: list[Vacancy] = []
        for spec in vac_specs:
            v = Vacancy(user_id=user.id, **spec)
            db.add(v)
            vacs.append(v)
        db.flush()

        # (vacancy_index, status, source, days_since_apply, comment)
        app_specs: list[tuple[int, ApplicationStatus, str, int, str]] = [
            (0, ApplicationStatus.tech_interview, "LinkedIn", 14, "Сильное совпадение по стеку."),
            (1, ApplicationStatus.hr_interview, "Сайт компании", 10, "Ждём слот на тех."),
            (2, ApplicationStatus.rejected, "HeadHunter", 30, "После теста — тишина."),
            (3, ApplicationStatus.offer, "Рекомендация", 21, "Быстрый процесс."),
            (4, ApplicationStatus.applied, "Telegram-канал", 3, "Недавно откликнулся."),
            (5, ApplicationStatus.test_task, "LinkedIn", 7, "Дедлайн тестового — пятница."),
            (6, ApplicationStatus.saved, "Хабр Карьера", 1, "Хочу доработать портфолио."),
            (7, ApplicationStatus.final_interview, "Сайт компании", 18, "Финал с директором по продукту."),
            (8, ApplicationStatus.tech_interview, "LinkedIn", 12, "Обсуждали архитектуру."),
            (9, ApplicationStatus.applied, "LinkedIn", 5, "Отправил сопроводительное."),
            (10, ApplicationStatus.hr_interview, "HeadHunter", 9, "Первичный скрининг пройден."),
            (11, ApplicationStatus.accepted, "Рекомендация", 40, "Принял оффер, выхожу через месяц."),
            (12, ApplicationStatus.applied, "Сайт компании", 2, "Жду ответа."),
            (13, ApplicationStatus.tech_interview, "LinkedIn", 11, "Live coding на Python."),
            (14, ApplicationStatus.rejected, "HeadHunter", 45, "Не сошлись по уровню."),
            (15, ApplicationStatus.saved, "LinkedIn", 0, "Запланировать отклик."),
        ]

        apps: list[Application] = []
        for vi, st, src, days, cmt in app_specs:
            a = Application(
                user_id=user.id,
                vacancy_id=vacs[vi].id,
                status=st,
                source=src,
                applied_date=date.today() - timedelta(days=days),
                comment=cmt,
            )
            db.add(a)
            apps.append(a)
        db.flush()

        interview_specs: list[tuple[int, str, int, InterviewFormat, str | None, str | None, str | None]] = [
            (0, "Техническое собеседование", 2, InterviewFormat.online, "Алексей Петров", None, "Подготовить примеры проектирования."),
            (1, "HR-скрининг", 5, InterviewFormat.phone, "Мария Иванова", None, "Уточнить структуру команды."),
            (0, "Знакомство с командой", -7, InterviewFormat.online, "Тимлид", "Пройдено", "Обсудили ожидания."),
            (3, "Финальное интервью", -2, InterviewFormat.offline, "CTO", "Положительно", "Ожидаем оффер."),
            (5, "Разбор тестового", 3, InterviewFormat.online, "Lead", None, "Показать код тестового."),
            (7, "Продуктовое интервью", 4, InterviewFormat.online, "CPO", None, "Метрики и roadmap."),
            (8, "Системный дизайн", 1, InterviewFormat.online, "Staff-инженер", None, "Черновик схемы до встречи."),
            (10, "HR, культура компании", 6, InterviewFormat.phone, "HR BP", None, "Гибкий график."),
            (13, "Парное программирование", -1, InterviewFormat.online, "Разработчик", "Ожидание фидбека", "Задача на итераторы."),
            (1, "Технический звонок", 8, InterviewFormat.online, "Engineering Manager", None, "Про команды и релизы."),
        ]

        interviews: list[Interview] = []
        for app_i, stage, day_off, fmt, intr, res, notes in interview_specs:
            it = Interview(
                user_id=user.id,
                application_id=apps[app_i].id,
                stage=stage,
                scheduled_at=now + timedelta(days=day_off),
                format=fmt,
                interviewer_name=intr,
                result=res,
                notes=notes,
            )
            db.add(it)
            interviews.append(it)
        db.flush()

        # Один оффер на отклик (уникальный application_id)
        offer_specs: list[tuple[int, float, float, int, int, RemoteFormat, str, str, str, str, bool, bool, str | None, str, date, date]] = [
            (
                3,
                400_000,
                0,
                3,
                20,
                RemoteFormat.office,
                "10:00–19:00",
                "Python, Kafka, Kubernetes",
                "Senior",
                "Москва",
                False,
                True,
                "Спортзал в офисе",
                "Максимальная зарплата, только офис.",
                date.today() - timedelta(days=5),
                date.today() + timedelta(days=9),
            ),
            (
                0,
                240_000,
                120_000,
                3,
                28,
                RemoteFormat.remote,
                "Гибкий",
                "Python, FastAPI, PostgreSQL",
                "Middle+",
                "Россия",
                True,
                True,
                "Курсы английского",
                "Баланс условий; хороший итог при типовых весах.",
                date.today() - timedelta(days=1),
                date.today() + timedelta(days=13),
            ),
            (
                1,
                210_000,
                0,
                3,
                24,
                RemoteFormat.hybrid,
                "Гибрид 3/2",
                "React, Node",
                "Middle",
                "Санкт-Петербург",
                False,
                False,
                None,
                "Ниже влияние страховки в сравнении.",
                date.today() - timedelta(days=4),
                date.today() + timedelta(days=10),
            ),
            (
                7,
                295_000,
                50_000,
                3,
                31,
                RemoteFormat.remote,
                "Асинхронная команда",
                "Go, k8s",
                "Senior",
                "Удалённо",
                False,
                True,
                "ДМС расширенный",
                "Сильный бонус и отпуск.",
                date.today() - timedelta(days=2),
                date.today() + timedelta(days=14),
            ),
            (
                10,
                195_000,
                30_000,
                3,
                21,
                RemoteFormat.hybrid,
                "Офис 2 дня",
                "Kotlin, Android",
                "Middle",
                "Казань",
                True,
                True,
                "Релокационный пакет",
                "Плюс релокация.",
                date.today() - timedelta(days=6),
                date.today() + timedelta(days=8),
            ),
            (
                12,
                175_000,
                0,
                2,
                18,
                RemoteFormat.remote,
                "4 ч пересечения с МСК",
                "Python, pytest",
                "Middle",
                "Удалённо",
                False,
                False,
                None,
                "Стартап, акции опционом.",
                date.today() - timedelta(days=3),
                date.today() + timedelta(days=11),
            ),
            (
                5,
                225_000,
                40_000,
                3,
                26,
                RemoteFormat.hybrid,
                "10–19 с плавающим стартом",
                "Go, PostgreSQL",
                "Middle+",
                "Екатеринбург",
                False,
                True,
                "Обеды за счёт компании",
                "После успешного тестового.",
                date.today() - timedelta(days=1),
                date.today() + timedelta(days=7),
            ),
        ]

        for app_i, sal, bon, prob, vacd, rf, sched, stack, grade, loc, reloc, ins, addben, nts, odt, ddt in offer_specs:
            o = Offer(
                user_id=user.id,
                application_id=apps[app_i].id,
                salary=sal,
                currency="RUB",
                bonus=bon,
                probation_months=prob,
                vacation_days=vacd,
                remote_format=rf,
                schedule=sched,
                stack=stack,
                grade=grade,
                location=loc,
                relocation_support=reloc,
                insurance=ins,
                additional_benefits=addben,
                notes=nts,
                offer_date=odt,
                deadline_date=ddt,
                status=OfferStatus.active,
            )
            db.add(o)

        note_specs: list[tuple[str, str | None, int | None, int | None, int | None]] = [
            ("Стратегия поиска", "В Q1 приоритет — продуктовые компании и удалёнка.", None, None, None),
            ("Подготовка к Саммиту", "Перечитать публичный блог про архитектуру.", vacs[3].id, None, None),
            ("Северный код", "Техсобес через два дня.", None, apps[0].id, None),
            ("Заметки к техраунду", "Асинхронный SQLAlchemy и пулы соединений.", None, None, interviews[0].id),
            ("Сравнение офферов", "Зафиксировать веса: зарплата 0.35, удалёнка 0.2.", None, None, None),
            ("ФинТех", "Уточнить размер команды и онбординг.", vacs[13].id, None, None),
            ("Тестовое Гранит", "Покрыть краевые случаи в API.", None, apps[5].id, None),
            ("НейроЛаб", "Спросить про GPU и данные.", vacs[8].id, None, None),
        ]

        for title, text, vid, aid, iid in note_specs:
            db.add(
                Note(
                    user_id=user.id,
                    title=title,
                    text=text,
                    vacancy_id=vid,
                    application_id=aid,
                    interview_id=iid,
                )
            )

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
