# Launch Preparation Checklist

## Done In Code

- TiDB is connected and the backend is running against it.
- Customer booking with image upload is fixed.
- Registered sessions appear on the staff board.
- Admin branches, lanes, and users are loading correctly.
- Add-ons are working, including branch-specific add-ons.

## Done In Data Cleanup

- Obvious test/demo vehicle sessions created during verification have been removed.
- Temporary test branch records created during verification have been removed.
- Temporary test add-on records created during verification have been removed.

## Still Required Before Public Launch

- Rotate the TiDB password because it was exposed during setup.
- Update the backend host environment with the new TiDB password.
- Finish SendGrid domain verification and sender setup.
- Set production mail env vars on the backend host.
- Do one real hosted OTP email test.
- Review TiDB for any remaining manual demo data you do not want in production.

## Recommended Hosting Stack

- Frontend: Vercel
- Backend: Render
- Database: TiDB Cloud

## Minimum Final Test

1. Customer registers account.
2. Customer signs in.
3. Customer books a wash with image.
4. Session appears on the staff REGISTERED board.
5. Staff starts and completes wash.
6. Customer sees final COMPLETED status in portal.
7. OTP email is received in a real inbox.
