# Fitness Tracker (Google Sheets + Claude API)

A Google Sheet that logs food in plain English and auto-fills calories/protein/carbs/fat using the Claude API, tracks weight trend, and logs workouts.

## What you get

- **Log** tab — type food + quantity in column A (e.g. `120g broccoli`), and Claude fills in Calories, Protein, Carbs, Fat automatically.
- **Dashboard** tab — daily progress bars toward your goals (1,620 cal / 130g protein / 150g carbs / 50g fat), calories/macros remaining, weight trend chart, and lbs lost toward your 10 lb goal.
- **Weight Log** tab — Date + Weight (lbs), with an auto-calculated Delta column.
- **Workout Log** tab — Date, Workout Type (dropdown), Exercises, Sets/Reps. You fill this in manually.

Your stats are pre-set as goals: 5'3", 144 lbs → 134 lbs goal, moderately active, lifting 3–4x/week. You can change the goal numbers any time directly on the Dashboard tab (cells C4:C7, B17, B19).

---

## Setup (step by step, no coding experience needed)

### 1. Get a Claude API key
1. Go to [console.anthropic.com](https://console.anthropic.com) and sign in or create an account.
2. Go to **API Keys** (left sidebar) and click **Create Key**.
3. Copy the key (starts with `sk-ant-...`). Keep this private — don't share it or paste it into the sheet itself.
4. You'll need to add billing/credits on the Anthropic console for the API calls to work (Settings > Billing).

### 2. Create the Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com) and create a **Blank spreadsheet**.
2. Name it something like "Fitness Tracker".

### 3. Add the script
1. In your new sheet, click **Extensions > Apps Script**. This opens the script editor in a new tab.
2. You'll see a file called `Code.gs` with some default text — delete everything in it.
3. Open the `Code.gs` file from this project (in this folder) and copy **all** of its contents.
4. Paste it into the empty `Code.gs` in the Apps Script editor.
5. In the Apps Script editor, click the gear icon (**Project Settings**) on the left sidebar, scroll down — there's no need to touch anything there yet, just note this is where Script Properties live (next step).
6. Click the **Save** icon (floppy disk) at the top.

### 4. Add your Claude API key (securely — not hardcoded in the script)
You have two options:

**Option A — easiest:**
1. Go back to your Google Sheet (not the script editor).
2. Refresh the page. A new menu called **Fitness Tracker** will appear in the menu bar.
3. Click **Fitness Tracker > Set Claude API Key**, paste your key from Step 1, click OK.

**Option B — manual:**
1. In the Apps Script editor, click the gear icon **Project Settings** on the left sidebar.
2. Scroll to **Script Properties** and click **Add script property**.
3. Property: `ANTHROPIC_API_KEY`. Value: paste your key. Click **Save script properties**.

Either way, the key is stored securely in your script's settings — never visible in the spreadsheet itself or in this code.

### 5. Run setup to build all the tabs
1. Back in your Google Sheet, click **Fitness Tracker > Run Setup**.
2. The first time you run this, Google will ask you to authorize the script:
   - Click **Continue**, pick your Google account.
   - You'll see a warning "Google hasn't verified this app" — this is normal for your own personal script. Click **Advanced** > **Go to [project name] (unsafe)** > **Allow**.
3. The script will build the **Log**, **Dashboard**, **Weight Log**, and **Workout Log** tabs automatically, with formulas, dropdowns, and a weight trend chart.

### 6. Start using it
- **Log tab**: type a food description + quantity in column A and press Enter. Wait a few seconds — Claude will fill in columns B–E automatically, and column F gets today's date.
- **Weight Log tab**: type today's date in column A and your weight in column B. The Delta column fills in automatically.
- **Workout Log tab**: fill in manually — pick a Workout Type from the dropdown (Chest/Push, Back/Pull, Legs, Arms/Core, Full Body, Cardio, Other) based on your routine, and type exercises + sets/reps.
- **Dashboard tab**: updates automatically as you log food and weight. Check it any time for daily progress and your weight trend toward your 10 lb goal.

### Re-running setup
If you ever want to reset the tabs (e.g. start fresh), just click **Fitness Tracker > Run Setup** again. Note: this clears and rebuilds the Log, Dashboard, Weight Log, and Workout Log tabs, so back up any data you want to keep first (File > Make a copy).

---

## Files in this repo

- `Code.gs` — the full Apps Script source (menu, setup, Claude API integration, triggers).
- `appsscript.json` — Apps Script project manifest (timezone, runtime settings).
- `README.md` — this file.

## Notes on the goals

Defaults baked into `Code.gs` (edit the constants at the top and re-run setup, or just edit the Dashboard cells directly):

| Setting | Value |
|---|---|
| Calorie goal | 1,620 |
| Protein goal | 130g |
| Carbs goal | 150g |
| Fat goal | 50g |
| Starting weight | 144 lbs |
| Goal weight | 134 lbs |
