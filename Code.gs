/**
 * Fitness Tracker — Calorie/Macro/Weight/Workout tracker with Claude API food logging.
 * Run "Fitness Tracker > Run Setup" from the spreadsheet menu once to build all tabs.
 */

// ---- Goals (edit these and re-run setup, or just edit the cells on the Dashboard tab) ----
const CALORIE_GOAL = 1620;
const PROTEIN_GOAL = 130;
const CARBS_GOAL = 150;
const FAT_GOAL = 50;
const START_WEIGHT = 144;
const GOAL_WEIGHT = 134;

const CLAUDE_MODEL = 'claude-sonnet-4-6';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

const SHEET_LOG = 'Log';
const SHEET_DASHBOARD = 'Dashboard';
const SHEET_WEIGHT = 'Weight Log';
const SHEET_WORKOUT = 'Workout Log';

// ---------------- Menu ----------------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Fitness Tracker')
    .addItem('Run Setup', 'setupSpreadsheet')
    .addItem('Set Claude API Key', 'promptForApiKey')
    .addToUi();
}

function promptForApiKey() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt('Set Claude API Key', 'Paste your Anthropic API key:', ui.ButtonSet.OK_CANCEL);
  if (result.getSelectedButton() === ui.Button.OK) {
    const key = result.getResponseText().trim();
    if (key) {
      PropertiesService.getScriptProperties().setProperty('ANTHROPIC_API_KEY', key);
      ui.alert('API key saved.');
    }
  }
}

// ---------------- Setup ----------------

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupLogTab(ss);
  setupWeightTab(ss);
  setupWorkoutTab(ss);
  setupDashboardTab(ss);
  setupInstallableTrigger(ss);
  ss.toast('Fitness Tracker setup complete!');
}

function setupInstallableTrigger(ss) {
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(t => t.getHandlerFunction() === 'handleSheetEdit');
  if (!exists) {
    ScriptApp.newTrigger('handleSheetEdit')
      .forSpreadsheet(ss)
      .onEdit()
      .create();
  }
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  sheet.clear();
  return sheet;
}

function setupLogTab(ss) {
  const sheet = getOrCreateSheet(ss, SHEET_LOG);
  sheet.getRange('A1:F1').setValues([['Food Entry', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Date']]);
  sheet.getRange('A1:F1').setFontWeight('bold').setBackground('#4a86e8').setFontColor('white');
  sheet.setColumnWidth(1, 320);
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(2, 4, 100);
  sheet.setColumnWidth(6, 110);
}

function setupWeightTab(ss) {
  const sheet = getOrCreateSheet(ss, SHEET_WEIGHT);
  sheet.getRange('A1:C1').setValues([['Date', 'Weight (lbs)', 'Delta']]);
  sheet.getRange('A1:C1').setFontWeight('bold').setBackground('#4a86e8').setFontColor('white');
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, 3, 120);
}

function setupWorkoutTab(ss) {
  const sheet = getOrCreateSheet(ss, SHEET_WORKOUT);
  sheet.getRange('A1:D1').setValues([['Date', 'Workout Type', 'Exercises', 'Sets/Reps Completed']]);
  sheet.getRange('A1:D1').setFontWeight('bold').setBackground('#4a86e8').setFontColor('white');
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 110);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 320);
  sheet.setColumnWidth(4, 320);

  const types = ['Chest/Push', 'Back/Pull', 'Legs', 'Arms/Core', 'Full Body', 'Cardio', 'Other'];
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(types, true).build();
  sheet.getRange('B2:B500').setDataValidation(rule);
}

function setupDashboardTab(ss) {
  const sheet = getOrCreateSheet(ss, SHEET_DASHBOARD);
  sheet.setColumnWidths(1, 1, 160);
  sheet.setColumnWidths(2, 3, 110);

  sheet.getRange('A1').setValue('Today\'s Progress').setFontWeight('bold').setFontSize(14);

  sheet.getRange('A3:D3').setValues([['Metric', 'Consumed', 'Goal', 'Remaining']]);
  sheet.getRange('A3:D3').setFontWeight('bold').setBackground('#eeeeee');

  sheet.getRange('A4').setValue('Calories');
  sheet.getRange('B4').setFormula(`=SUMIFS(${SHEET_LOG}!B:B,${SHEET_LOG}!F:F,TODAY())`);
  sheet.getRange('C4').setValue(CALORIE_GOAL);
  sheet.getRange('D4').setFormula('=C4-B4');

  sheet.getRange('A5').setValue('Protein (g)');
  sheet.getRange('B5').setFormula(`=SUMIFS(${SHEET_LOG}!C:C,${SHEET_LOG}!F:F,TODAY())`);
  sheet.getRange('C5').setValue(PROTEIN_GOAL);
  sheet.getRange('D5').setFormula('=C5-B5');

  sheet.getRange('A6').setValue('Carbs (g)');
  sheet.getRange('B6').setFormula(`=SUMIFS(${SHEET_LOG}!D:D,${SHEET_LOG}!F:F,TODAY())`);
  sheet.getRange('C6').setValue(CARBS_GOAL);
  sheet.getRange('D6').setFormula('=C6-B6');

  sheet.getRange('A7').setValue('Fat (g)');
  sheet.getRange('B7').setFormula(`=SUMIFS(${SHEET_LOG}!E:E,${SHEET_LOG}!F:F,TODAY())`);
  sheet.getRange('C7').setValue(FAT_GOAL);
  sheet.getRange('D7').setFormula('=C7-B7');

  // Progress bars
  sheet.getRange('A9').setValue('Progress Bars').setFontWeight('bold');
  const labels = ['Calories', 'Protein', 'Carbs', 'Fat'];
  for (let i = 0; i < 4; i++) {
    const row = 10 + i;
    sheet.getRange(row, 1).setValue(labels[i]);
    sheet.getRange(row, 2).setFormula(`=SPARKLINE(B${4 + i},{"charttype","bar";"max",C${4 + i};"color1","#34a853"})`);
  }

  // Weight progress
  sheet.getRange('A16').setValue('Weight Progress').setFontWeight('bold').setFontSize(14);
  sheet.getRange('A17').setValue('Starting Weight (lbs)');
  sheet.getRange('B17').setValue(START_WEIGHT);
  sheet.getRange('A18').setValue('Current Weight (lbs)');
  sheet.getRange('B18').setFormula(`=IFERROR(INDEX(${SHEET_WEIGHT}!B:B,COUNT(${SHEET_WEIGHT}!B:B)+1),B17)`);
  sheet.getRange('A19').setValue('Goal Weight (lbs)');
  sheet.getRange('B19').setValue(GOAL_WEIGHT);
  sheet.getRange('A20').setValue('Lbs Lost');
  sheet.getRange('B20').setFormula('=B17-B18');
  sheet.getRange('A21').setValue('Lbs to Goal (of 10)');
  sheet.getRange('B21').setFormula('=B17-B19');
  sheet.getRange('A22').setValue('% to Goal');
  sheet.getRange('B22').setFormula('=IFERROR(B20/B21,0)');
  sheet.getRange('B22').setNumberFormat('0%');
  sheet.getRange('A23').setValue('Goal Progress Bar');
  sheet.getRange('B23').setFormula('=SPARKLINE(B20,{"charttype","bar";"max",B21;"color1","#fbbc04"})');

  buildWeightChart(ss, sheet);
}

function buildWeightChart(ss, dashboardSheet) {
  const weightSheet = ss.getSheetByName(SHEET_WEIGHT);
  const charts = dashboardSheet.getCharts();
  charts.forEach(c => dashboardSheet.removeChart(c));

  const chart = dashboardSheet.newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(weightSheet.getRange('A1:B1000'))
    .setPosition(2, 6, 0, 0)
    .setOption('title', 'Weight Trend')
    .setOption('legend', { position: 'none' })
    .setOption('hAxis', { title: 'Date' })
    .setOption('vAxis', { title: 'Weight (lbs)' })
    .build();
  dashboardSheet.insertChart(chart);
}

// ---------------- onEdit triggers ----------------
// NOTE: this must run as an INSTALLABLE trigger (Triggers > Add Trigger > handleSheetEdit > On edit),
// not a simple onEdit(e) trigger — simple triggers run in a restricted sandbox that blocks
// UrlFetchApp.fetch (the Claude API call) regardless of granted OAuth scopes.

function handleSheetEdit(e) {
  const sheet = e.range.getSheet();
  const name = sheet.getName();

  if (name === SHEET_LOG && e.range.getColumn() === 1 && e.range.getRow() > 1) {
    handleLogEdit(sheet, e.range.getRow());
  } else if (name === SHEET_WEIGHT && e.range.getColumn() === 2 && e.range.getRow() > 1) {
    handleWeightEdit(sheet, e.range.getRow());
  }
}

function handleLogEdit(sheet, row) {
  const food = sheet.getRange(row, 1).getValue();
  if (!food) return;

  sheet.getRange(row, 2, 1, 4).setValue('...');
  const macros = getMacrosFromClaude(food);
  if (macros) {
    sheet.getRange(row, 2, 1, 4).setValues([[macros.calories, macros.protein_g, macros.carbs_g, macros.fat_g]]);
  } else {
    sheet.getRange(row, 2, 1, 4).setValue('Error');
  }
  sheet.getRange(row, 6).setValue(new Date());
  sheet.getRange(row, 6).setNumberFormat('yyyy-mm-dd');
}

function handleWeightEdit(sheet, row) {
  const weight = sheet.getRange(row, 2).getValue();
  if (!weight) return;
  if (row === 2) {
    sheet.getRange(row, 3).setValue(0);
  } else {
    const prevWeight = sheet.getRange(row - 1, 2).getValue();
    sheet.getRange(row, 3).setValue(prevWeight ? weight - prevWeight : '');
  }
}

// ---------------- Claude API ----------------

function getMacrosFromClaude(foodDescription) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) {
    SpreadsheetApp.getActiveSpreadsheet().toast('No Claude API key set. Use Fitness Tracker > Set Claude API Key.');
    return null;
  }

  const payload = {
    model: CLAUDE_MODEL,
    max_tokens: 200,
    system: 'You are a nutrition database. Given a food description with a quantity, return ONLY a JSON object with keys calories, protein_g, carbs_g, fat_g (numeric values, no units, no markdown, no explanation). Use standard USDA nutrition estimates.',
    messages: [{ role: 'user', content: foodDescription }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(CLAUDE_API_URL, options);
    const code = response.getResponseCode();
    if (code !== 200) {
      Logger.log('Claude API error %s: %s', code, response.getContentText());
      return null;
    }
    const json = JSON.parse(response.getContentText());
    const text = json.content[0].text.trim().replace(/^```json\s*|```$/g, '');
    const macros = JSON.parse(text);
    return macros;
  } catch (err) {
    Logger.log('Claude API call failed: %s', err);
    return null;
  }
}
