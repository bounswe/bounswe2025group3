# Live Testing Setup - Milestone Presentation

## Current Configuration

### Backend
- **Status**: ✅ Running on Docker
- **URL**: `http://192.168.1.65:8000`
- **Database**: PostgreSQL (local)
- **Access**: Both web and mobile connect to this local backend

### Mobile App  
- **Branch**: `mobile-live-test` (based on dev with all badge fixes)
- **API URL**: `http://192.168.1.65:8000` (configured in `constants/api.ts`)
- **Running**: Expo Go on Android emulator/device
- **Port**: 8081 (Expo Metro)

### Frontend Web
- **Branch**: dev
- **API URL**: Configured via `.env` (should point to `http://localhost:8000/api`)
- **Port**: 3000 (React dev server)
- **Access**: `http://localhost:3000`

---

## Testing Scenario (15 minutes total)

### Part 1: Web (15:00-15:08 - Mehmet Emin Atak) - 8 minutes

**User Actions:**
1. ✅ Register new account
2. ❌ Try to create event with curse words → **Fail** (validation)
3. ✅ Create event normally with photo (showing new features)
4. ✅ Enter leaderboard, see rank and anonymous status
5. ✅ Check personal statistics page (feels competitive)

**Backend Events Created:**
- New user registered
- New event created → **Sends notification to all users in that city**

---

### Part 2: Mobile (15:08-15:15 - Barathan) - 7 minutes

**User Actions:**
1. ✅ **Receive notification** (event created from web)
   - Notification popup appears
   - Shows event details
   
2. ✅ **Participate in the event**
   - Opens event from notification
   - Clicks "Participate" button
   - Gets "First Event" badge (**Note: This badge doesn't exist yet in backend**)
   
3. ✅ **Explore badges**
   - Opens badges page from notification or navigation
   - Sees list of badges with earned/locked status
   - **Finds**: "Battery Saver" badge (log lithium battery to earn)
   
4. ✅ **Log lithium battery**
   - Goes to waste logging
   - Selects "Batteries" category → "Lithium Battery"
   - Enters quantity: 1
   - Submits log
   - **Gets "Battery Saver" badge popup!** (if badge exists in backend)

---

## Pre-Testing Checklist

### Backend
- [x] Docker containers running (`docker ps`)
- [x] Database migrations applied
- [x] Test users exist (or can register)
- [ ] "First Event" badge exists in backend (**ACTION NEEDED: Request from backend team**)
- [ ] "Battery Saver" badge exists for lithium battery logging

### Mobile
- [x] Branch: `mobile-live-test`
- [x] API URL: `http://192.168.1.65:8000`
- [x] Expo running
- [x] App loaded in Expo Go
- [ ] Test account logged in (or ready to login)
- [x] Badge system working (popups + page display)
- [x] Notification system working (polling every 30s)

### Web
- [ ] Frontend running on `http://localhost:3000`
- [ ] Connected to local backend
- [ ] Test account ready (for event creation)
- [ ] Event creation form working
- [ ] Photo upload working

---

## Known Issues & Limitations

### 1. ⚠️ "First Event" Badge Missing
- **Issue**: Backend doesn't have "First Event" badge implemented yet
- **Impact**: Step 2 of mobile scenario won't show badge popup
- **Workaround**: 
  - Skip badge check for event participation
  - OR request backend team to add it before testing
  - OR demonstrate with different badge

### 2. ⚠️ Badge Check Timing
- **Behavior**: Badge checks happen 1 second after actions (waste log, event participation)
- **Impact**: ~1-2 second delay before popup appears
- **Status**: This is intentional (allows backend processing time)

### 3. ⚠️ Notification Polling
- **Behavior**: Notifications check every 30 seconds
- **Impact**: May take up to 30 seconds to receive event notification
- **Workaround**: Manually pull-to-refresh notifications page, or wait

### 4. ⚠️ First-Time Badge Display
- **Behavior**: First time opening app marks existing badges as "already shown"
- **Impact**: Won't show popups for badges earned before app install
- **Workaround**: Clear AsyncStorage to reset:
  ```javascript
  AsyncStorage.multiRemove(['@shown_badge_ids_<userId>', '@badge_system_initialized_<userId>']);
  ```

---

## Quick Commands

### Start Backend (if not running)
```bash
cd bounswe2025group3/practice-app
docker-compose up
```

### Start Frontend
```bash
cd bounswe2025group3/practice-app/frontend-web
npm start
# Opens on http://localhost:3000
```

### Start Mobile (Already Running)
```bash
cd bounswe2025group3/practice-app/mobile
npx expo start --clear
# Scan QR code with Expo Go app
```

### Check Backend Status
```bash
docker ps --filter "name=practice-app"
curl http://192.168.1.65:8000/api/
```

### Clear Badge Cache (Mobile Testing)
```javascript
// In React Native Debugger console:
AsyncStorage.multiRemove(['@shown_badge_ids_9', '@badge_system_initialized_9'])
  .then(() => console.log('Badge cache cleared!'));
```

---

## Troubleshooting

### Backend Not Accessible
```bash
# Check if containers are running
docker ps

# Restart backend
docker-compose restart backend

# Check logs
docker-compose logs -f backend
```

### Mobile Can't Connect
1. Verify IP address: `ipconfig getifaddr en0`
2. Update `mobile/constants/api.ts` if IP changed
3. Restart Expo: `npx expo start --clear`
4. Check firewall allows port 8000

### Notifications Not Appearing
1. Check backend is running and accessible
2. Verify user is logged in
3. Pull-to-refresh on notifications page
4. Check 30-second polling interval (wait)
5. Check backend logs for notification creation

### Badge Popup Not Showing
1. Verify badge exists in backend
2. Check badge is not in "already shown" list
3. Wait 1-2 seconds after action
4. Check console logs for errors
5. Try clearing badge cache

---

## Post-Testing

### Save Test Data
- [ ] Screenshot successful badge popup
- [ ] Screenshot notification received
- [ ] Export logs if needed

### Cleanup
- [ ] Stop Expo: Ctrl+C in terminal
- [ ] Stop frontend: Ctrl+C in terminal  
- [ ] Keep backend running (or stop with `docker-compose down`)

### Push Changes
```bash
cd bounswe2025group3/practice-app/mobile
git add .
git commit -m "test: Live testing successful for milestone presentation"
git push origin mobile-live-test
```

---

## Contact Info
- **Backend Issues**: Contact backend team
- **Badge Implementation**: Coordinate with backend for missing badges
- **Deployment**: Check with team lead for production deployment

