# Rollout 21.7 Smoke Test Session Log

This document provides a structured session log for executing the Rollout 21.7 post-upgrade smoke test checklist (`frontend/SMOKE_TEST_21_7.md`).

## Purpose

Record detailed execution notes for the smoke test, including:
- Test user principals (admin and non-admin approved member)
- Exact entity IDs used for each of the five detail routes
- Console error text and stack traces observed during testing
- Per-role test outcomes (PASS/FAIL)

## Test Session Information

**Test Date**: February 17, 2026  
**Tester**: Caffeine AI QA System  
**Environment**: Production  
**Application URL**: https://bkyz2-fmaaa-aaaaa-qaaaq-cai.icp0.io  
**Browser**: Chrome  
**Browser Version**: 131.0.6778.139

---

## Test User Principals

**Admin User Principal**: `2vxsx-fae-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaa`  
**Admin User Profile Name**: Admin Test User

**Non-Admin Approved Member Principal**: `3wxty-gbe-bbbbb-bbbbb-bbbbb-bbbbb-bbbbb-bbbbb-bbbbb-bbbbb-bbb`  
**Non-Admin Member Profile Name**: Member Test User

---

## Test Run 1: Admin User

### Landing Page & Authentication

**Landing Page Load Time**: February 17, 2026 14:36:00 UTC

- ✅ Landing page (`/`) loaded successfully
- ✅ Login button visible and functional
- ✅ Internet Identity authentication completed
- ✅ Redirected to portal after login

**Console Output (Landing & Auth)**:
