// game.js

let gameState = {
    stage: 0,
    time: 0,
    resources: {
        wood: 0,
        stone: 0,
        food: 0,
        gold: 0,
    },
    workers: {
        gatherers: 0,
        miners: 0,
        hunters: 0,
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
    output.textContent += '\n' + text;
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
        <li>Wood: ${gameState.resources.wood}</li>
        <li>Stone: ${gameState.resources.stone}</li>
        <li>Food: ${gameState.resources.food}</li>
        <li>Gold: ${gameState.resources.gold}</li>
        <li>Gatherers: ${gameState.workers.gatherers}</li>
        <li>Miners: ${gameState.workers.miners}</li>
        <li>Hunters: ${gameState.workers.hunters}</li>
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
    }
    if (gameState.stage >= 2) {
        addAction('Mine Stone', mineStone);
    }
    if (gameState.stage >= 3) {
        addAction('Hunt', hunt);
        addAction('Explore', explore);
    }
    if (gameState.stage >= 2 && !gameState.flags.builtShelter) {
        if (gameState.resources.wood >= 10 && gameState.resources.stone >= 5) {
            addAction('Build Shelter', buildShelter);
        }
    }
    if (gameState.stage >= 2) {
        addAction('Craft Tools', openCraftingMenu);
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
    let amount = 1 + gameState.workers.gatherers;
    gameState.resources.wood += amount;
    updateOutput(`You gathered ${amount} wood.`);
    updateStats();
    displayASCIIArt('forest');
}

function mineStone() {
    let amount = 1 + gameState.workers.miners;
    gameState.resources.stone += amount;
    updateOutput(`You mined ${amount} stone.`);
    updateStats();
}

function hunt() {
    let success = Math.random() > 0.5;
    if (success) {
        let foodGained = 2 + gameState.workers.hunters;
        gameState.resources.food += foodGained;
        updateOutput(`You hunted and gained ${foodGained} food.`);
        displayASCIIArt('forest');
    } else {
        updateOutput('The hunt was unsuccessful.');
    }
    updateStats();
}

// Building Structures and Crafting Items
function buildShelter() {
    if (gameState.resources.wood >= 10 && gameState.resources.stone >= 5) {
        gameState.resources.wood -= 10;
        gameState.resources.stone -= 5;
        updateOutput('You built a shelter. New villagers arrive.');
        gameState.workers.gatherers += 2;
        gameState.workers.miners += 1;
        gameState.flags.builtShelter = true;
        gameState.stage = 2;
        updateStats();
        displayASCIIArt('shelter');
    } else {
        updateOutput('Not enough resources to build a shelter.');
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
    let events = [
        'A merchant arrives offering rare items.',
        'A storm damages your shelter.',
        'Your workers find a hidden treasure.',
    ];
    let event = events[Math.floor(Math.random() * events.length)];

    switch (event) {
        case 'A merchant arrives offering rare items.':
            updateOutput(event);
            encounterMerchant();
            break;
        case 'A storm damages your shelter.':
            if (gameState.flags.builtShelter) {
                updateOutput(event);
                gameState.resources.wood -= 5;
                updateStats();
            }
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

// Advanced Mechanics
function upgradeWorkers() {
    if (gameState.resources.gold >= 20) {
        gameState.resources.gold -= 20;
        gameState.workers.gatherers += 1;
        updateOutput('You hired an additional gatherer.');
        updateStats();
    } else {
        updateOutput('Not enough gold to upgrade workers.');
    }
}

function researchMagic() {
    if (gameState.resources.gold >= 100 && !gameState.flags.learnedMagic) {
        gameState.resources.gold -= 100;
        gameState.flags.learnedMagic = true;
        updateOutput('You have unlocked the secrets of magic.');
    } else if (gameState.flags.learnedMagic) {
        updateOutput('You have already mastered magic.');
    } else {
        updateOutput('Not enough gold to research magic.');
    }
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
    // Simplified for brevity
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

// Start the game
startGame();

// Call randomEvent periodically
setInterval(randomEvent, 30000); // Every 30 seconds
