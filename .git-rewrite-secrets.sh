#!/bin/bash
# Script to remove secrets from git history

echo "Rewriting git history to remove exposed secrets..."

# Use git filter-branch to replace secrets in all commits
git filter-branch --force --tree-filter '
if [ -f "DEPLOYMENT_CHECKLIST.md" ]; then
  sed -i "s/TWILIO_ACCOUNT_SID=ACd2c66ee794c66f217318bb5273bcb309/TWILIO_ACCOUNT_SID=your_twilio_account_sid/g" DEPLOYMENT_CHECKLIST.md 2>/dev/null || true
  sed -i "s/TWILIO_AUTH_TOKEN=ACd2c66ee794c66f217318bb5273bcb309/TWILIO_AUTH_TOKEN=your_twilio_auth_token/g" DEPLOYMENT_CHECKLIST.md 2>/dev/null || true
  sed -i "s|OPENAI_API_KEY=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|OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx|g" DEPLOYMENT_CHECKLIST.md 2>/dev/null || true
  sed -i "s/ADMIN_PASSWORD=reg2025memorial/ADMIN_PASSWORD=your_secure_password/g" DEPLOYMENT_CHECKLIST.md 2>/dev/null || true
  sed -i "s|+61485009396|+61XXXXXXXXX|g" DEPLOYMENT_CHECKLIST.md 2>/dev/null || true
fi
if [ -f "SMS_SETUP.md" ]; then
  sed -i "s/TWILIO_ACCOUNT_SID=ACd2c66ee794c66f217318bb5273bcb309/TWILIO_ACCOUNT_SID=your_twilio_account_sid/g" SMS_SETUP.md 2>/dev/null || true
  sed -i "s/TWILIO_AUTH_TOKEN=ACd2c66ee794c66f217318bb5273bcb309/TWILIO_AUTH_TOKEN=your_twilio_auth_token/g" SMS_SETUP.md 2>/dev/null || true
  sed -i "s|OPENAI_API_KEY=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|OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx|g" SMS_SETUP.md 2>/dev/null || true
  sed -i "s/ADMIN_PASSWORD=reg2025memorial/ADMIN_PASSWORD=your_secure_password/g" SMS_SETUP.md 2>/dev/null || true
  sed -i "s|+61485009396|+61XXXXXXXXX|g" SMS_SETUP.md 2>/dev/null || true
fi
' --tag-name-filter cat -- --all

echo "Git history rewritten. Force push required."
echo "Run: git push --force-with-lease origin main"
