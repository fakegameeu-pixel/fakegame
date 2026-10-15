# Настройка Firebase

1. Создайте проект в Firebase Console и добавьте Web App.
2. В **Authentication → Sign-in method** включите провайдер **Email/Password**.
3. В **Firestore Database** создайте базу данных в production mode и опубликуйте правила из `firestore.rules`.
4. В **Storage** создайте bucket и опубликуйте правила из `storage.rules`. Фотографии участников хранятся там и доступны только администратору.
5. Скопируйте параметры web-приложения в `.env` или `.env.local` по образцу `.env.example`.
6. В **Project settings → Service accounts** создайте новый private key. Значения `project_id`, `client_email` и `private_key` добавьте в `.env` или `.env.local` как `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`. Для private key замените реальные переводы строк на `\n` и оберните значение в кавычки.
7. Укажите желаемый постоянный UID (от 1 до 128 символов) в `FIREBASE_ADMIN_UID` файла `.env` или `.env.local`, затем один раз выполните локальную команду. Она создаст единственный аккаунт в Firebase Authentication и защищённый профиль администратора в Firestore:

```powershell
npm run create:single-admin -- admin@example.com "Имя администратора"
```

Пароль команда запросит скрыто в терминале; он не попадёт в историю команд.

После первого входа откройте `/workspace`: администратор создаёт роли и видит участников с фото и назначенными ролями. UID в `FIREBASE_ADMIN_UID` — единственный UID, которому сервер разрешает административные действия. Менеджер с ролью `manager` загружает портрет участника, выбирает пол и сохраняет участие; роль выбирается на сервере и менеджеру доступна только для текущей регистрации.
