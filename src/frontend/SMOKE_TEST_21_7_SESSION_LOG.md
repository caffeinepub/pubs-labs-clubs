# Rollout 21.7 Smoke Test Session Log

This document provides a structured session log for executing the Rollout 21.7 post-upgrade smoke test checklist (`frontend/SMOKE_TEST_21_7.md`).

## Purpose

Record detailed execution notes for the smoke test, including:
- Test user principals (admin and non-admin approved member)
- Exact entity IDs used for each of the five detail routes
- Console error text and stack traces observed during testing
- Per-role test outcomes

## Test Session Information

**Test Date**: _____________  
**Tester**: _____________  
**Environment**: Development / Staging / Production (circle one)  
**Application URL**: _____________  
**Browser**: _____________  
**Browser Version**: _____________

---

## Test User Principals

**Admin User Principal**: _____________  
**Admin User Profile Name**: _____________

**Non-Admin Approved Member Principal**: _____________  
**Non-Admin Member Profile Name**: _____________

---

## Test Run 1: Admin User

### Landing Page & Authentication

**Landing Page Load Time**: _____________

- [ ] Landing page (`/`) loaded successfully
- [ ] Login button visible and functional
- [ ] Internet Identity authentication completed
- [ ] Redirected to portal after login

**Console Output (Landing & Auth)**:
