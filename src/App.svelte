<script>
import rarity from "./rarity.js";
const storage = createStorage();
const rarityNames = Object.keys(rarity);
let selectedRarity = storage.get("selectedRarity", "iron");
let goalLevel = Math.min(storage.get("goalLevel", 99), rarity[selectedRarity].length);
const expUnits = {
  "微金祝": 1750,
  "小銀祝": 4000,
  "八倍白胖": 8000,
  "活動經驗包": 10000,
  "八倍皇帝": 16000,
  "小金祝/贈送祝聖": 18000,
  "小白祝": 19000,
  "小黑祝": 20000,
  "八倍黑胖": 40000,
  "大祝聖哈比": 150000
};
const goalLevelPresets = {
  iron: [],
  bronze: [],
  silver: [30, 50, 55],
  gold: [20, 50, 60, 80, 99],
  platinum: [50, 70, 90, 99],
  black: [50, 80, 99]
};
const selectedUnits = Object.assign(
  Object.fromEntries(Object.entries(expUnits).map(([name]) => [name, 0])),
  storage.get("selectedUnits")
);
let totalExp = 0;
$: requiredMinValue = rarity[selectedRarity][goalLevel - 1] - totalExp;
let requiredMinLevel = 0;
let sarietto = storage.get("sarietto", false);
let goalLevelPresetNext = 0;
let goalLevelPresetPrev = 0;

$: storage.set("selectedRarity", selectedRarity);
$: storage.set("goalLevel", goalLevel);
$: storage.set("selectedUnits", selectedUnits);
$: storage.set("sarietto", sarietto);

// calc total exp
$: {
  totalExp = 0;
  const multiply = sarietto ? 11 : 10;
  for (const [name, count] of Object.entries(selectedUnits)) {
    totalExp += count * expUnits[name] * multiply / 10;
  }
}

// calc required min level
$: {
  // find the level of min value
  requiredMinLevel = rarity[selectedRarity].findIndex(f => f > requiredMinValue);
  if (requiredMinLevel < 0) {
    requiredMinLevel = rarity[selectedRarity].length;
  }
  requiredMinLevel--;
}

// goal level cap
$: {
  if (goalLevel >= rarity[selectedRarity].length) {
    goalLevel = rarity[selectedRarity].length;
  }
}

// calc goal level default
$: {
  const defaults = goalLevelPresets[selectedRarity];
  let index;
  if (defaults[defaults.length - 1] < goalLevel) {
    index = defaults.length;
  } else {
    index = defaults.findIndex(i => i >= goalLevel);
  }
  goalLevelPresetPrev = index > 0 ? defaults[index - 1] : 0;
  if (index >= 0 && defaults[index] === goalLevel) {
    if (index + 1 < defaults.length) {
      index++;
    } else {
      index = -1;
    }
  }
  goalLevelPresetNext = index >= 0 ? defaults[index] : 0;
}

function createStorage() {
  return {get, set};
  
  function get(key, default_) {
    const value = localStorage.getItem(key);
    if (value === null) {
      return default_;
    }
    return JSON.parse(value);
  }
  
  function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
</script>

<style>
label {
  display: block;
}
input, select {
  font: inherit;
  padding: 0.1em 0.3em;
}
input[type=number] {
  width: 100%;
  box-sizing: border-box;
}
.form-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
}
.number-group {
  display: grid;
  grid-template-columns: max-content 1fr max-content;
}
.span-2 {
  grid-column-end: span 2;
}
</style>

<h1>Aigis EXP Calculator</h1>
<p>
共可獲得 {totalExp} 經驗。

{#if requiredMinValue < 0}
  經驗值溢出 {-requiredMinValue}。
{:else}
  需先餵銅肥至 LV{requiredMinLevel + 1} ({rarity[selectedRarity][requiredMinLevel + 1] - requiredMinValue || '-'})。
{/if}
</p>
<div class="form-group">
  <label for="rarity">稀有度</label>
  <select id="rarity" bind:value={selectedRarity}>
    {#each rarityNames as name}
      <option value={name}>{name}</option>
    {/each}
  </select>
  <label for="goalLevel">目標等級</label>
  <div class="number-group">
    <button type="button" on:click={() => goalLevel = goalLevelPresetPrev} disabled={!goalLevelPresetPrev} title={goalLevelPresetPrev || ""}>&lt;</button>
    <input id="goalLevel" type="number" bind:value={goalLevel} min="0">
    <button type="button" on:click={() => goalLevel = goalLevelPresetNext} disabled={!goalLevelPresetNext} title={goalLevelPresetNext || ""}>&gt;</button>
  </div>
  <label class="span-2">
    <input type="checkbox" bind:checked={sarietto}>
    使用育成聖靈
  </label>
</div>
<fieldset>
  <legend>聖靈︰</legend>
  <div class="form-group">
    {#each Object.entries(expUnits) as [unitName, value]}
      <label for={unitName}>
        {unitName} ({value})
      </label>
      <div class="number-group">
        <button type="button" on:click={() => selectedUnits[unitName]--} disabled={selectedUnits[unitName] < 1}>-</button>
        <input id={unitName} type="number" bind:value={selectedUnits[unitName]} min="0">
        <button type="button" on:click={() => selectedUnits[unitName]++}>+</button>
      </div>
    {/each}
  </div>
</fieldset>
