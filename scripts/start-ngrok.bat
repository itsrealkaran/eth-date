@echo off
echo Starting ngrok tunnel for your Next.js app...
echo.
echo Make sure your Next.js app is running on port 3000
echo You can start it with: pnpm dev
echo.
echo Starting ngrok...
ngrok http 3000
pause
