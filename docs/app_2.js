//Time Tracker:
    //3-29: 4 hours

///////////////////
// Landscaper
///////////////////

//Game State Object
const gameState = {
    totalBank: 0,
    dayNumber: 0,
    toolsAvailable: [0],   //remove if still not using this - TODO
    toolsSelected: [ 0 ],
    winBankTotal : 100,
    gameEndOutcome: null,
    tools : [
        {id: 0, name: 'teeth', cost: 1, income: 1, resellEnabled: true, inventory: 0, equipped: 1, dispName: 'Teeth'},
        {id: 1, name: 'rusty scissors', cost: 5, income: 5, resellEnabled: true, inventory: 0, equipped: 0, dispName: 'Scissors'},
        {id: 2, name: 'old-timey push lawnmower', cost: 25, income: 50, resellEnabled: true, inventory: 0, equipped: 0, dispName: 'Push Mower'},
        {id: 3, name: 'fancy battery-powered lawnmower', cost: 250, income: 100, resellEnabled: true, inventory: 0, equipped: 0, dispName: 'Battery Mower'},
        {id: 4, name: 'team of starving students', cost: 500, income: 250, resellEnabled: false, inventory: 0, equipped: 0, dispName: 'Team'},
    ],
    buttonList: {},
    //Returns Game state Summary
    showGameState : function() {
        return `on Day ${this.dayNumber} with $${this.totalBank}. You had managed to equip: ${this.printToolsSelected()}.`;
    },
    //Prints the tools in the toolsSelected array as a string 'tool1, tool2, ...'
    printToolsSelected: function() {
        let toolsSelectedStringArr = []
       
        for(let i=0; i < this.toolsSelected.length; i++) {
            let toolIndex = this.toolsSelected[i];
            toolsSelectedStringArr.push(`${this.tools[toolIndex].name} x ${this.tools[toolIndex].equipped}`);
        }
        return toolsSelectedStringArr.join(', ');
    },
    //Adds a tool to the inventory
    addToInventory: function(toolNum) {
        this.tools[toolNum].inventory++;
        this.rebuildToolsAvailable();
    },
    removeFromInventory: function(toolNum) {
        this.tools[toolNum].inventory--;
        this.rebuildToolsAvailable();
    },
    addToEquipped: function(toolNum) {
        this.tools[toolNum].equipped++;
        this.rebuildToolsSelected();
    },
    removeFromEquipped: function(toolNum) {
        this.tools[toolNum].equipped--;
        this.rebuildToolsSelected();
    },
    //Rebuild tools Selected array
    rebuildToolsSelected: function() {
        this.toolsSelected = [];
        for(let i=0; i < this.tools.length; i++) {
            if(this.tools[i].equipped > 0) {
                this.toolsSelected.push(i);
            }
        }
    },
    rebuildToolsAvailable: function() {
        this.toolsAvailable = [];
        for(let i=0; i < this.tools.length; i++) {
            if(this.tools[i].inventory > 0) {
                this.toolsAvailable.push(i);
            }
        }
    },

    //Calculates 1 day of work income based on tools in toolsSelected array
    calculateDailyIncome: function() {
        let dailyIncome = 0;
        for(let i=0; i < this.tools.length; i++) {
            dailyIncome += this.tools[i].income * this.tools[i].equipped;
        }
        this.totalBank += dailyIncome;

        return dailyIncome;
    },
    //Increments dayNumber by 1 and returns new total
    incrementDay: function() {
        this.dayNumber +=1;
        return this.dayNumber;
    },
    resetGameState: function() {
        this.totalBank = 0;
        this.dayNumber = 0;
        this.toolsAvailable = [0];
        this.toolsSelected = [ 0 ];
        this.gameEndOutcome = null;
        updateScreenInfo(this.dayNumber, this.totalBank);

        //Clear inventory and equipped
        for (let toolObj of this.tools)
        {
            if (toolObj.id === 0) {
                toolObj.equipped = 1;
                toolObj.inventory = 0;
            }
            else {
                toolObj.equipped = 0;
                toolObj.inventory = 0;
            }
        }
        //Clear terminal - or bring back help message
        clearTerminal();
        updateScreenInfo(0, 0);
    },
    gameEndInfo : function() {
        if(gameState.gameEndOutcome === 'quit') {
            return `You quit the game ${gameState.showGameState()} You lose.`;
        }
        else if(gameState.gameEndOutcome === 'win') {
            return `You won the game ${gameState.showGameState()} Nice job!`;
        }
    
    }
}

//////////////////////////
// Helper Functions
///////////////////////////
const logAndAlert = (string) => {
    console.log(string);
    alert(string);
}
const printToTerminal = (string) => {
    //Trying to print to webpage terminal
    let terminalLine = document.createElement('p');
    terminalLine.textContent = string;
    let textWindow = document.getElementsByClassName('text-window')[0];
    textWindow.appendChild(terminalLine);
    textWindow.scrollTop = textWindow.scrollHeight;

}
//Clear Terminal and print Welcome message
const clearTerminal = () => {
    //Trying to print to webpage terminal
    let terminalLine = document.createElement('p');
    terminalLine.textContent = 'Welcome: In this game you will work to mow lawns. As you make money you can buy tools to help you cut and earn more';
    
    let textWindow = document.getElementsByClassName('text-window')[0];
    while (textWindow.firstChild) {
        textWindow.removeChild(textWindow.firstChild);
    }

    textWindow.appendChild(terminalLine);
    textWindow.scrollTop = textWindow.scrollHeight;

}
const updateScreenInfo = (dayNumber, totalMoney) => {
    //Dashboard
    document.getElementsByClassName('day-number')[0].textContent = 'Day: '+dayNumber;
    document.getElementsByClassName('total-money')[0].textContent = 'Bank: $'+totalMoney; 

    //Get each inventory button
    let allInventButtons = document.querySelectorAll('.inventory-container > li > .tool-name')
    for (let i =0; i < allInventButtons.length; i++ ) {
        allInventButtons[i].textContent = `${gameState.tools[i].dispName} x ${gameState.tools[i].inventory}`;
}
    //Get each equipped button
    let allEquippedButtons = document.querySelectorAll('.equipped-container > li')
    for (let i=0; i< allEquippedButtons.length; i++) {
        allEquippedButtons[i].textContent = `${gameState.tools[i].dispName} x ${gameState.tools[i].equipped}`;
    }
}





//should probably be a method - TODO
// const gameEndInfo = (gameState) => {
//     if(gameState.gameEndOutcome === 'quit') {
//         return `You quit the game ${gameState.showGameState()} You lose.`;
//     }
//     else if(gameState.gameEndOutcome === 'win') {
//         return `You won the game ${gameState.showGameState()} Nice job!`;
//     }

// }
////////////////////
// Main Game Core
////////////////////

//Work Day Button
const workDay = () => {
    
    //Calculates income based on tools equipped, adds to bank
    let workDayIncome = gameState.calculateDailyIncome();
    
    //Increments day
    gameState.incrementDay();
    
    //Send info to fake terminal
    printToTerminal(`Day ${gameState.dayNumber}: You worked using the ${gameState.printToolsSelected()}. You have made: $${workDayIncome} (Total: $${gameState.totalBank})`);

    //Update Dashboard
    updateScreenInfo(gameState.dayNumber, gameState.totalBank);
    

    //check win condition
    if (gameState.totalBank > 100) {
        gameState.gameEndOutcome = 'win';
        gameEnd();
    }

    //Item Unlocking - TODO - for now just making available if funds are sufficient
}

//Shop Button
const shopPurchase0 = () => {
    purchaseTool(0);
}
const shopPurchase1 = () => {
    purchaseTool(1);
}
const shopPurchase2 = () => {
    purchaseTool(2);
}
const shopPurchase3 = () => {
    purchaseTool(3);
}
const shopPurchase4 = () => {
    purchaseTool(4);
}
const purchaseTool = (toolNum) => {
    let toolObj = gameState.tools[toolNum]
    let toolCost = toolObj.cost;
    let availableFunds = gameState.totalBank;
    if (toolCost > availableFunds) {
        printToTerminal(`Not enough money for ${toolObj.name}. $${toolCost-availableFunds} short...`);
    }
    else {
        //Add to inventory
        gameState.addToInventory(toolNum);
        //Decrement cost from bank
        gameState.totalBank -= toolCost;
        updateScreenInfo(gameState.dayNumber, gameState.totalBank);
        printToTerminal(`Purchased ${toolObj.name} for $${toolObj.cost}. Remember to equip the tool to use it!`)
    }
}

//Inventory Buttons and Functions
const inventorySell0 = () => {
    inventorySell(0);
}
const inventoryEquip0 = () => {
    inventoryEquip(0);
}
const inventorySell1 = () => {
    inventorySell(1);
}
const inventoryEquip1 = () => {
    inventoryEquip(1);
}
const inventorySell2 = () => {
    inventorySell(2);
}
const inventoryEquip2 = () => {
    inventoryEquip(2);
}
const inventorySell3 = () => {
    inventorySell(3);
}
const inventoryEquip3 = () => {
    inventoryEquip(3);
}
const inventorySell4 = () => {
    inventorySell(4);
}
const inventoryEquip4 = () => {
    inventoryEquip(4);
}
//Sell Functionality
const inventorySell = (toolNum) => {
    let toolObj = gameState.tools[toolNum];

    if (toolObj.inventory > 0) {
        gameState.removeFromInventory(toolNum);
        gameState.totalBank += (toolObj.cost)/2;
        updateScreenInfo(gameState.dayNumber, gameState.totalBank);
        printToTerminal(`Sold ${toolObj.name} for $${toolObj.cost/2}.`)
        if (gameState.totalBank > 100) {
            gameState.gameEndOutcome = 'win';
            gameEnd();
        }
    }
    else{
        printToTerminal(`Unable to sell ${toolObj.name}, none in inventory.`)
    }

}
//Equip Functionality
const inventoryEquip = (toolNum) => {
    let toolObj = gameState.tools[toolNum];

    if (toolObj.inventory > 0) {
        gameState.removeFromInventory(toolNum);
    
        //need code to equip it in gameState
        gameState.addToEquipped(toolNum);
    
        updateScreenInfo(gameState.dayNumber, gameState.totalBank);
            //Check that this will update displat for equipped too
        printToTerminal(`Equipped ${toolObj.name}. ${toolObj.equipped} equipped now!`)
    }
    else {
        printToTerminal(`Unable to equip ${toolObj.name}, none in inventory.`)
    }
}

//Un-Equip Buttons and Functions
const unequipTool0 = () => {
    unequipTool(0);
}
const unequipTool1 = () => {
    unequipTool(1);
}
const unequipTool2 = () => {
    unequipTool(2);
}
const unequipTool3 = () => {
    unequipTool(3);
}
const unequipTool4 = () => {
    unequipTool(4);
}
const unequipTool = (toolNum) => {
    let toolObj = gameState.tools[toolNum];

    if (toolObj.equipped > 0) {
        gameState.removeFromEquipped(toolNum);
    
        //Add to inventory
        gameState.addToInventory(toolNum);
        //Update display 
        updateScreenInfo(gameState.dayNumber, gameState.totalBank);
        printToTerminal(`Unequipped ${toolObj.name}. ${toolObj.equipped} equipped now.`)
    }
    else {   //If we have nothing to unequip, give error
        printToTerminal(`Unable to unequip ${toolObj.name}, none equipped.`)
    }
}


//Game Quit Button
const gameQuitOption = () => {
    gameState.gameEndOutcome = 'quit';
    gameEnd();
}
const gameEnd = () => {
    printToTerminal(gameState.gameEndInfo());
    disableAllButtons();
}

const disableAllButtons = () => {
    //Quit
    gameState.buttonList['quit-button'].removeEventListener('click', gameQuitOption);
    //Go to Work
    document.getElementsByClassName('work-button')[0].removeEventListener('click', workDay);
    //loop through shop
    document.querySelectorAll('.shop-container > li')[0].removeEventListener('click', shopPurchase0);
    document.querySelectorAll('.shop-container > li')[1].removeEventListener('click', shopPurchase1);
    document.querySelectorAll('.shop-container > li')[2].removeEventListener('click', shopPurchase2);
    document.querySelectorAll('.shop-container > li')[3].removeEventListener('click', shopPurchase3);
    document.querySelectorAll('.shop-container > li')[4].removeEventListener('click', shopPurchase4);

    //loop through inventory
    //Inventory Buttons
    // Teeth - 0
    document.querySelectorAll('.inventory-container > li > .minus')[0].removeEventListener('click', inventorySell0);
    document.querySelectorAll('.inventory-container > li > .plus')[0].removeEventListener('click', inventoryEquip0);
    // Scissors - 1
    document.querySelectorAll('.inventory-container > li > .minus')[1].removeEventListener('click', inventorySell1);
    document.querySelectorAll('.inventory-container > li > .plus')[1].removeEventListener('click', inventoryEquip1);
    //Push Mower - 2
    document.querySelectorAll('.inventory-container > li > .minus')[2].removeEventListener('click', inventorySell2);
    document.querySelectorAll('.inventory-container > li  > .plus')[2].removeEventListener('click', inventoryEquip2);
    // Batt Mower - 3
    document.querySelectorAll('.inventory-container > li > .minus')[3].removeEventListener('click', inventorySell3);
    document.querySelectorAll('.inventory-container > li  > .plus')[3].removeEventListener('click', inventoryEquip3);
    // Team - 4
    document.querySelectorAll('.inventory-container > li > .minus')[4].removeEventListener('click', inventorySell4);
    document.querySelectorAll('.inventory-container > li > .plus')[4].removeEventListener('click', inventoryEquip4);
    

    //Un-Equip Buttons
    document.querySelectorAll('.equipped-container > li')[0].removeEventListener('click', unequipTool0);
    document.querySelectorAll('.equipped-container > li')[1].removeEventListener('click', unequipTool1);
    document.querySelectorAll('.equipped-container > li')[2].removeEventListener('click', unequipTool2);
    document.querySelectorAll('.equipped-container > li')[3].removeEventListener('click', unequipTool3);
    document.querySelectorAll('.equipped-container > li')[4].removeEventListener('click', unequipTool4);
    
}

//Start Game - initialize key buttons
const gameMainStart = () => {

    //Reset Game:
    gameState.resetGameState();
    printToTerminal('<<< Game Start >>>')
    
    //Quit Button
    gameState.buttonList['quit-button']= document.getElementsByClassName('quit-button')[0];
    gameState.buttonList['quit-button'].addEventListener('click', gameQuitOption);

    //Work Button
    document.getElementsByClassName('work-button')[0].addEventListener('click', workDay);
    
    //Shop Buttons
    document.querySelectorAll('.shop-container > li')[0].addEventListener('click', shopPurchase0);
    document.querySelectorAll('.shop-container > li')[1].addEventListener('click', shopPurchase1);
    document.querySelectorAll('.shop-container > li')[2].addEventListener('click', shopPurchase2);
    document.querySelectorAll('.shop-container > li')[3].addEventListener('click', shopPurchase3);
    document.querySelectorAll('.shop-container > li')[4].addEventListener('click', shopPurchase4);

    //Inventory Buttons
    // Teeth - 0
    document.querySelectorAll('.inventory-container > li > .minus')[0].addEventListener('click', inventorySell0);
    document.querySelectorAll('.inventory-container > li > .plus')[0].addEventListener('click', inventoryEquip0);
    // Scissors - 1
    document.querySelectorAll('.inventory-container > li > .minus')[1].addEventListener('click', inventorySell1);
    document.querySelectorAll('.inventory-container > li > .plus')[1].addEventListener('click', inventoryEquip1);
    //Push Mower - 2
    document.querySelectorAll('.inventory-container > li > .minus')[2].addEventListener('click', inventorySell2);
    document.querySelectorAll('.inventory-container > li  > .plus')[2].addEventListener('click', inventoryEquip2);
    // Batt Mower - 3
    document.querySelectorAll('.inventory-container > li > .minus')[3].addEventListener('click', inventorySell3);
    document.querySelectorAll('.inventory-container > li  > .plus')[3].addEventListener('click', inventoryEquip3);
    // Team - 4
    document.querySelectorAll('.inventory-container > li > .minus')[4].addEventListener('click', inventorySell4);
    document.querySelectorAll('.inventory-container > li > .plus')[4].addEventListener('click', inventoryEquip4);
    

    //Un-Equip Buttons
    document.querySelectorAll('.equipped-container > li')[0].addEventListener('click', unequipTool0);
    document.querySelectorAll('.equipped-container > li')[1].addEventListener('click', unequipTool1);
    document.querySelectorAll('.equipped-container > li')[2].addEventListener('click', unequipTool2);
    document.querySelectorAll('.equipped-container > li')[3].addEventListener('click', unequipTool3);
    document.querySelectorAll('.equipped-container > li')[4].addEventListener('click', unequipTool4);
}

//Setup start button after DOM loads
//gameMainLoop();
window.onload=function(){
    document.getElementsByClassName('start-button')[0].addEventListener('click', gameMainStart);
    //document.getElementById('reset-button').addEventListener('click', resetList);
}

