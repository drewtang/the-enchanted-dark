// game.js

let gameState = {
    stage: 0,
    time: 0,
    resources: {
        wood: 0,
        stone: 0,
        iron: 0,
        food: 0,
        gold: 0,
    },
    workers: {
        idle: 0,
        gatherers: 0,
        miners: 0,
        hunters: 0,
        blacksmiths: 0,
    },
    buildings: {
        shelters: 0,
        maxWorkers: 0,
        shelterDurability: {},
        blacksmith: false,
    },
    inventory: {
        tools: {},
        weapons: {},
        artifacts: {},
    },
    quests: [],
    flags: {},
};

const output = document.getElementById('output');
const actions = document.getElementById('actions');
const statsList = document.getElementById('stats-list');
const inventoryList = document.getElementById('inventory-list');
const asciiArt = document.getElementById('ascii-art');

// Utility Functions
function updateOutput(text) {
    const maxMessages = 10; // Maximum number of messages to display
    const messages = output.textContent.split('\n');
    messages.push(text);
    if (messages.length > maxMessages) {
        messages.shift(); // Remove the oldest message
    }
    output.textContent = messages.join('\n');
    output.scrollTop = output.scrollHeight; // Auto-scroll to the bottom
}

function clearActions() {
    actions.innerHTML = '';
}

function addAction(text, onClick) {
    const button = document.createElement('button');
    button.className = 'button';
    button.textContent = text;
    button.onclick = onClick;
    actions.appendChild(button);
}

function updateStats() {
    statsList.innerHTML = `
        <li>Wood: ${gameState.resources.wood.toFixed(0)}</li>
        <li>Stone: ${gameState.resources.stone.toFixed(0)}</li>
        <li>Iron: ${gameState.resources.iron.toFixed(0)}</li>
        <li>Food: ${gameState.resources.food.toFixed(0)}</li>
        <li>Gold: ${gameState.resources.gold.toFixed(0)}</li>
        <li>Shelters: ${gameState.buildings.shelters}</li>
        <li>Idle Workers: ${gameState.workers.idle}</li>
        <li>Gatherers: ${gameState.workers.gatherers}</li>
        <li>Miners: ${gameState.workers.miners}</li>
        <li>Hunters: ${gameState.workers.hunters}</li>
        <li>Blacksmiths: ${gameState.workers.blacksmiths}</li>
    `;
}

function updateInventory() {
    inventoryList.innerHTML = '';
    for (let category in gameState.inventory) {
        for (let item in gameState.inventory[category]) {
            inventoryList.innerHTML += `<li>${item}: ${gameState.inventory[category][item]}</li>`;
        }
    }
}

// Start the game
function startGame() {
    updateOutput('A whisper echoes: "Find the light within the darkness."');
    gameState.stage = 1;
    mainLoop();
}

// Main Game Loop
function mainLoop() {
    clearActions();
    updateStats();
    updateInventory();
    gameState.time += 1;

    // Events based on time or conditions
    if (gameState.time === 1) {
        prologue();
    }

    if (gameState.stage >= 1) {
        addAction('Gather Wood', gatherWood);
        addAction('Mine Stone', mineStone);
    }
    if (gameState.stage >= 2) {
        addAction('Hunt', hunt);
        addAction('Explore', explore);
    }
    if (gameState.flags.builtShelter) {
        addAction('Manage Workers', manageWorkers);
    }
    if (gameState.buildings.shelters < 5) {
        addAction('Build Shelter', buildShelter);
    }
    if (gameState.buildings.blacksmith) {
        addAction('Mine Iron', mineIron);
    }
    if (gameState.buildings.shelters >= 2 && !gameState.buildings.blacksmith) {
        addAction('Build Blacksmith', buildBlacksmith);
    }
    if (gameState.flags.metMystic) {
        // Additional actions if needed
    }
    if (gameState.quests.includes('Find the Lost Relic')) {
        addAction('Continue Quest', startQuest);
    }
    if (gameState.flags.gameCompleted) {
        addAction('Restart Game', restartGame);
    }

    // Check for story progression
    progressStory();

    // Repeat mainLoop every few seconds
    setTimeout(mainLoop, 2000);
}

// Prologue and Story Introduction
function prologue() {
    updateOutput('You find yourself alone, the darkness is overwhelming.');
    displayASCIIArt('forest');
}

// ASCII Art Display
function displayASCIIArt(scene) {
    let art = '';
    switch (scene) {
        case 'forest':
            art = `
        /\\
       /**\\
      /****\\   /\\
     /      \\ /**\\
    /  /\\    /    \\
    `;
            break;
        case 'shelter':
            art = `
       /\\
      /  \\
     /____\\
     |    |
     |____|
    `;
            break;
        case 'enemy':
            art = `
       /\\
      (  )
       \\/
       /\\
      /  \\
    `;
            break;
        case 'victory':
            art = `
      \\o/
       |
      / \\
    `;
            break;
        default:
            art = '';
    }
    asciiArt.textContent = art;
}

// Resource Gathering Functions
function gatherWood() {
    let amount = 1 + gameState.workers.gatherers * 1;
    gameState.resources.wood += amount;
    updateOutput(`You gathered ${amount.toFixed(0)} wood.`);
    updateStats();
    displayASCIIArt('forest');
}

function mineStone() {
    let amount = 1 + gameState.workers.miners * 1;
    gameState.resources.stone += amount;
    updateOutput(`You mined ${amount.toFixed(0)} stone.`);
    updateStats();
}

function mineIron() {
    let amount = gameState.workers.miners * 0.5;
    gameState.resources.iron += amount;
    updateOutput(`Your miners gathered ${amount.toFixed(1)} iron.`);
    updateStats();
}

// Hunting Function
function hunt() {
    let amount = gameState.workers.hunters * 2;
    if (amount > 0) {
        gameState.resources.food += amount;
        updateOutput(`Your hunters gathered ${amount} food.`);
        updateStats();
    } else {
        updateOutput('You have no hunters assigned.');
    }
}

// Building Structures and Crafting Items
function buildShelter() {
    let shelterCost = {
        wood: Math.floor(10 * Math.pow(1.5, gameState.buildings.shelters)),
        stone: Math.floor(5 * Math.pow(1.5, gameState.buildings.shelters)),
    };

    if (gameState.resources.wood >= shelterCost.wood && gameState.resources.stone >= shelterCost.stone) {
        gameState.resources.wood -= shelterCost.wood;
        gameState.resources.stone -= shelterCost.stone;
        gameState.buildings.shelters += 1;
        gameState.buildings.maxWorkers += 3;
        updateOutput('You built a shelter. New villagers arrive.');
        gameState.workers.idle += 3;
        gameState.flags.builtShelter = true;
        gameState.stage = 2;
        updateStats();
        displayASCIIArt('shelter');

        // Initialize shelter durability
        let shelterId = 'shelter_' + gameState.buildings.shelters;
        gameState.buildings.shelterDurability[shelterId] = 100; // Max durability
    } else {
        updateOutput('Not enough resources to build a shelter.');
    }
}

function buildBlacksmith() {
    if (gameState.resources.wood >= 50 && gameState.resources.stone >= 30 && gameState.resources.iron >= 20) {
        gameState.resources.wood -= 50;
        gameState.resources.stone -= 30;
        gameState.resources.iron -= 20;
        gameState.buildings.blacksmith = true;
        updateOutput('You built a Blacksmith.');
        updateStats();
    } else {
        updateOutput('Not enough resources to build a Blacksmith.');
    }
}

function openCraftingMenu() {
    clearActions();
    addAction('Craft Axe (5 Wood, 2 Stone)', () => craftTool('Axe'));
    addAction('Craft Pickaxe (3 Wood, 4 Stone)', () => craftTool('Pickaxe'));
    addAction('Back', mainLoop);
}

function craftTool(tool) {
    let requirements = {
        Axe: { wood: 5, stone: 2 },
        Pickaxe: { wood: 3, stone: 4 },
    };

    let canCraft = true;
    for (let resource in requirements[tool]) {
        if (gameState.resources[resource] < requirements[tool][resource]) {
            canCraft = false;
            break;
        }
    }

    if (canCraft) {
        for (let resource in requirements[tool]) {
            gameState.resources[resource] -= requirements[tool][resource];
        }
        gameState.inventory.tools[tool] = (gameState.inventory.tools[tool] || 0) + 1;
        updateOutput(`You crafted a ${tool}.`);
        updateInventory();
    } else {
        updateOutput(`Not enough resources to craft ${tool}.`);
    }
    mainLoop();
}

// Worker Management
function manageWorkers() {
    clearActions();
    updateStats();
    updateInventory();

    updateOutput('Assign your workers to tasks.');

    addAction('Assign Gatherer (+)', () => {
        if (gameState.workers.idle > 0) {
            gameState.workers.idle--;
            gameState.workers.gatherers++;
            updateStats();
        }
        manageWorkers();
    });
    addAction('Remove Gatherer (-)', () => {
        if (gameState.workers.gatherers > 0) {
            gameState.workers.gatherers--;
            gameState.workers.idle++;
            updateStats();
        }
        manageWorkers();
    });
    addAction('Assign Miner (+)', () => {
        if (gameState.workers.idle > 0) {
            gameState.workers.idle--;
            gameState.workers.miners++;
            updateStats();
        }
        manageWorkers();
    });
    addAction('Remove Miner (-)', () => {
        if (gameState.workers.miners > 0) {
            gameState.workers.miners--;
            gameState.workers.idle++;
            updateStats();
        }
        manageWorkers();
    });
    addAction('Assign Hunter (+)', () => {
        if (gameState.workers.idle > 0) {
            gameState.workers.idle--;
            gameState.workers.hunters++;
            updateStats();
        }
        manageWorkers();
    });
    addAction('Remove Hunter (-)', () => {
        if (gameState.workers.hunters > 0) {
            gameState.workers.hunters--;
            gameState.workers.idle++;
            updateStats();
        }
        manageWorkers();
    });
    if (gameState.buildings.blacksmith) {
        addAction('Assign Blacksmith (+)', () => {
            if (gameState.workers.idle > 0) {
                gameState.workers.idle--;
                gameState.workers.blacksmiths++;
                updateStats();
            }
            manageWorkers();
        });
        addAction('Remove Blacksmith (-)', () => {
            if (gameState.workers.blacksmiths > 0) {
                gameState.workers.blacksmiths--;
                gameState.workers.idle++;
                updateStats();
            }
            manageWorkers();
        });
    }
    addAction('Back', mainLoop);
}

// Adjust Workers After Shelter Loss
function adjustWorkersAfterShelterLoss() {
    let totalWorkers = gameState.workers.idle + gameState.workers.gatherers + gameState.workers.miners + gameState.workers.hunters + gameState.workers.blacksmiths;
    if (totalWorkers > gameState.buildings.maxWorkers) {
        let excessWorkers = totalWorkers - gameState.buildings.maxWorkers;
        // Remove excess workers starting from idle
        if (gameState.workers.idle >= excessWorkers) {
            gameState.workers.idle -= excessWorkers;
        } else {
            excessWorkers -= gameState.workers.idle;
            gameState.workers.idle = 0;
            // Remove from other worker types as needed
            if (gameState.workers.gatherers >= excessWorkers) {
                gameState.workers.gatherers -= excessWorkers;
            } else {
                excessWorkers -= gameState.workers.gatherers;
                gameState.workers.gatherers = 0;
                if (gameState.workers.miners >= excessWorkers) {
                    gameState.workers.miners -= excessWorkers;
                } else {
                    excessWorkers -= gameState.workers.miners;
                    gameState.workers.miners = 0;
                    if (gameState.workers.hunters >= excessWorkers) {
                        gameState.workers.hunters -= excessWorkers;
                    } else {
                        excessWorkers -= gameState.workers.hunters;
                        gameState.workers.hunters = 0;
                        // Continue for other worker types if necessary
                    }
                }
            }
        }
        updateOutput(`${excessWorkers} workers have left due to lack of shelter.`);
    }
}

// Shelter Repair Mechanics
function damageShelter() {
    let shelterIds = Object.keys(gameState.buildings.shelterDurability);
    if (shelterIds.length > 0) {
        let randomShelter = shelterIds[Math.floor(Math.random() * shelterIds.length)];
        gameState.buildings.shelterDurability[randomShelter] -= 50; // Reduce durability
        if (gameState.buildings.shelterDurability[randomShelter] <= 0) {
            updateOutput('A shelter was destroyed!');
            delete gameState.buildings.shelterDurability[randomShelter];
            gameState.buildings.shelters--;
            gameState.buildings.maxWorkers -= 3;
            // Handle excess workers
            adjustWorkersAfterShelterLoss();
        } else {
            updateOutput('One of your shelters was damaged.');
            addAction('Repair Shelter', repairShelter);
        }
        updateStats();
    }
}

function repairShelter() {
    let repairCost = { wood: 5, stone: 2 };
    if (gameState.resources.wood >= repairCost.wood && gameState.resources.stone >= repairCost.stone) {
        gameState.resources.wood -= repairCost.wood;
        gameState.resources.stone -= repairCost.stone;
        // Repair the most damaged shelter
        let shelterIds = Object.keys(gameState.buildings.shelterDurability);
        let damagedShelter = shelterIds.find(id => gameState.buildings.shelterDurability[id] < 100);
        if (damagedShelter) {
            gameState.buildings.shelterDurability[damagedShelter] = 100; // Restore durability
            updateOutput('You repaired a shelter.');
            updateStats();
        }
        clearActions();
        mainLoop();
    } else {
        updateOutput('Not enough resources to repair the shelter.');
    }
}

// Introducing NPCs and Dialogue Choices
function meetMystic() {
    updateOutput('A mysterious figure appears, offering wisdom or a challenge.');
    clearActions();
    addAction('Seek Wisdom', seekWisdom);
    addAction('Accept Challenge', acceptChallenge);
}

function seekWisdom() {
    updateOutput('The mystic shares ancient knowledge. Your resource gathering is more efficient.');
    gameState.flags.seekWisdom = true;
    gameState.workers.gatherers += 1;
    gameState.workers.miners += 1;
    clearActions();
    mainLoop();
}

function acceptChallenge() {
    updateOutput('You are tasked with a quest to find the Lost Relic.');
    gameState.quests.push('Find the Lost Relic');
    gameState.flags.acceptChallenge = true;
    clearActions();
    mainLoop();
}

// Side Quests and Minigames
function startQuest() {
    updateOutput('You embark on a journey to find the Lost Relic.');
    clearActions();
    addAction('Search the Ancient Ruins', searchRuins);
    addAction('Venture into the Dark Forest', ventureForest);
    addAction('Back', mainLoop);
}

function searchRuins() {
    let success = Math.random() > 0.7;
    if (success) {
        updateOutput('You found the Lost Relic in the ruins!');
        gameState.inventory.artifacts['Lost Relic'] = 1;
        completeQuest('Find the Lost Relic');
        displayASCIIArt('victory');
    } else {
        updateOutput('The ruins were empty.');
    }
    clearActions();
    mainLoop();
}

function ventureForest() {
    let encounter = Math.random();
    if (encounter < 0.5) {
        updateOutput('You were ambushed by bandits!');
        minigameCombat();
    } else {
        updateOutput('You found a hidden path but no relic.');
    }
    clearActions();
    mainLoop();
}

function completeQuest(questName) {
    updateOutput(`Quest Completed: ${questName}`);
    gameState.quests = gameState.quests.filter(q => q !== questName);
    gameState.resources.gold += 50;
    updateStats();
}

function minigameCombat() {
    updateOutput('Combat Initiated!');
    let playerHealth = 100;
    let enemyHealth = 50;

    function attack() {
        let playerDamage = Math.floor(Math.random() * 20) + 5;
        let enemyDamage = Math.floor(Math.random() * 15) + 5;

        enemyHealth -= playerDamage;
        playerHealth -= enemyDamage;

        updateOutput(`You dealt ${playerDamage} damage. Enemy health: ${enemyHealth}`);
        updateOutput(`Enemy dealt ${enemyDamage} damage. Your health: ${playerHealth}`);

        displayASCIIArt('enemy');

        if (enemyHealth <= 0) {
            updateOutput('You defeated the enemy!');
            gameState.resources.gold += 20;
            clearActions();
            mainLoop();
        } else if (playerHealth <= 0) {
            updateOutput('You were defeated...');
            clearActions();
            mainLoop();
        }
    }

    clearActions();
    addAction('Attack', attack);
}

// Exploration and Random Events
function explore() {
    let locations = ['Abandoned Village', 'Mystic Lake', 'Enchanted Cave'];
    let location = locations[Math.floor(Math.random() * locations.length)];
    updateOutput(`You explore and find a ${location}.`);
    clearActions();
    addAction(`Enter ${location}`, () => enterLocation(location));
    addAction('Back', mainLoop);
}

function enterLocation(location) {
    switch (location) {
        case 'Abandoned Village':
            updateOutput('You found resources left behind.');
            gameState.resources.wood += 5;
            gameState.resources.stone += 5;
            updateStats();
            break;
        case 'Mystic Lake':
            updateOutput('You feel rejuvenated. Workers are more efficient.');
            gameState.workers.gatherers += 1;
            gameState.workers.miners += 1;
            break;
        case 'Enchanted Cave':
            updateOutput('You discover rare gems.');
            gameState.resources.gold += 10;
            updateStats();
            break;
    }
    clearActions();
    mainLoop();
}

function randomEvent() {
    let events = [];

    // Only include events applicable to the player's current state
    if (gameState.workers.gatherers + gameState.workers.miners + gameState.workers.hunters > 0) {
        events.push('Your workers find a hidden treasure.');
    }

    if (gameState.flags.builtShelter) {
        events.push('A merchant arrives offering rare items.');
        events.push('A storm damages your shelter.');
    }

    // Ensure there are events to choose from
    if (events.length === 0) {
        return; // No applicable events
    }

    let event = events[Math.floor(Math.random() * events.length)];

    switch (event) {
        case 'A merchant arrives offering rare items.':
            updateOutput(event);
            encounterMerchant();
            break;
        case 'A storm damages your shelter.':
            updateOutput(event);
            damageShelter();
            break;
        case 'Your workers find a hidden treasure.':
            updateOutput(event);
            gameState.resources.gold += 30;
            updateStats();
            break;
    }
}

function encounterMerchant() {
    clearActions();
    updateOutput('A merchant arrives offering rare items.');
    addAction('Buy Artifact (50 Gold)', () => {
        if (gameState.resources.gold >= 50) {
            gameState.resources.gold -= 50;
            gameState.inventory.artifacts['Mystic Orb'] = 1;
            updateOutput('You purchased the Mystic Orb.');
            updateInventory();
        } else {
            updateOutput('Not enough gold.');
        }
        clearActions();
        mainLoop();
    });
    addAction('Decline Offer', () => {
        updateOutput('The merchant departs.');
        clearActions();
        mainLoop();
    });
}

// Epic Fantasy Plotline
function progressStory() {
    if (gameState.inventory.artifacts['Lost Relic'] && gameState.flags.learnedMagic && !gameState.flags.finalBattleTriggered) {
        updateOutput('With the Lost Relic and your mastery of magic, you confront the source of darkness.');
        finalBattle();
        gameState.flags.finalBattleTriggered = true;
    }
}

function finalBattle() {
    updateOutput('An epic battle ensues...');
    let success = Math.random() > 0.5;
    if (success) {
        updateOutput('You have vanquished the darkness and restored light to the world!');
        displayASCIIArt('victory');
        gameState.flags.gameCompleted = true;
        clearActions();
        addAction('Restart Game', restartGame);
    } else {
        updateOutput('You were defeated by the darkness. Gather more resources and try again.');
    }
}

// Saving and Loading with Extended State
function saveGame() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
    updateOutput('Game saved.');
}

function loadGame() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        gameState = JSON.parse(savedState);
        updateOutput('Game loaded.');
        mainLoop();
    } else {
        updateOutput('No saved game found.');
    }
}

function restartGame() {
    localStorage.removeItem('gameState');
    location.reload();
}

// Start Random Events
function startRandomEvents() {
    if (document.visibilityState === 'visible') {
        randomEvent();
    }
    setTimeout(startRandomEvents, 30000); // Every 30 seconds
}

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        updateOutput('You return to the game.');
    } else {
        updateOutput('You have left the game.');
    }
});

// Start the game
startGame();
startRandomEvents();
