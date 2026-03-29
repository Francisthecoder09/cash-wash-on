# Hosting Guide

## Recommended Stack

- Frontend: Vercel
- Backend: Render
- Database: TiDB Cloud
- Email OTP: SendGrid

## Frontend on Vercel

### Project Settings

- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

### Frontend Environment Variables

- `VITE_API_URL=https://your-render-backend-url.onrender.com`
- `VITE_CUSTOMER_SESSION_WARNING_MINUTES=14`
- `VITE_CUSTOMER_SESSION_TIMEOUT_MINUTES=15`

## Backend on Render

### Project Settings

- Use the blueprint file: [`render.yaml`](C:/Users/HP/Desktop/car-wash-on/render.yaml)
- Root Directory: `backend`
- Runtime: `Docker`

### Backend Environment Variables

- `SPRING_DATASOURCE_URL=jdbc:mysql://your-tidb-host:4000/car_wash_ops?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2`
- `SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver`
- `SPRING_DATASOURCE_USERNAME=your_tidb_user`
- `SPRING_DATASOURCE_PASSWORD=your_tidb_password`
- `SPRING_SQL_INIT_MODE=always`
- `SPRING_SQL_INIT_SCHEMA_LOCATIONS=classpath:sql/schema-tidb.sql`
- `SPRING_SQL_INIT_DATA_LOCATIONS=classpath:sql/seed-tidb.sql`
- `APP_JWT_SECRET=replace_with_a_long_random_secret`
- `APP_JWT_EXPIRATION_MINUTES=720`
- `APP_CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app`
- `APP_MAIL_MOCK_ENABLED=false`
- `APP_MAIL_FROM=noreply@yourdomain.com`
- `SPRING_MAIL_HOST=smtp.sendgrid.net`
- `SPRING_MAIL_PORT=587`
- `SPRING_MAIL_USERNAME=apikey`
- `SPRING_MAIL_PASSWORD=your_sendgrid_api_key`
- `SPRING_MAIL_SMTP_AUTH=true`
- `SPRING_MAIL_SMTP_STARTTLS_ENABLE=true`

## Before You Go Live

1. Rotate the TiDB password if it was ever shared.
2. Finish SendGrid domain verification and sender setup.
3. Set `APP_CORS_ALLOWED_ORIGINS` to the real Vercel URL.
4. Deploy backend first, then set `VITE_API_URL` on Vercel.
5. Run one full test:
   - customer register
   - customer sign in
   - booking
   - payment
   - staff sees the session
   - customer tracking

## Important Files

- Backend deploy config: [`render.yaml`](C:/Users/HP/Desktop/car-wash-on/render.yaml)
- Frontend deploy config: [`vercel.json`](C:/Users/HP/Desktop/car-wash-on/vercel.json)
- Backend app config: [`application.yml`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/resources/application.yml)
- Frontend env template: [`frontend/.env.example`](C:/Users/HP/Desktop/car-wash-on/frontend/.env.example)
- Backend env template: [`backend/.env.example`](C:/Users/HP/Desktop/car-wash-on/backend/.env.example)
