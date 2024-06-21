// URL de la API
const apiUrl = 'https://api.langx.io/api/leaderboard/token';

const table = document.querySelector(".token-leaderboard-table");
const alwaysShow =  document.querySelector(".always-show");
const canHide =  document.querySelector(".can-hide");
const toggleShow = document.querySelector(".table-show");
const dropDownCol = document.querySelector(".token-leaderboard-table");

getData();
setInterval(getData, 60000);

async function getData() {
    try {
        const response = await fetch(apiUrl);
    
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        leaderboardToken(data.documents);
    
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

toggleShow.addEventListener("click", (e) => {
    const toggleShow = e.target;
    toggledDropDown(toggleShow, dropDownCol);
});

function toggledDropDown(toggleShow, dropDownCol) {
    const isOpened = dropDownCol.getAttribute("aria-expanded")
    const columns = dropDownCol.querySelector(".can-hide");

    if (isOpened === "true") {
        document.querySelector(".table-container").setAttribute("aria-expanded", false);
        dropDownCol.setAttribute("aria-expanded", false);
        columns.setAttribute("aria-hidden", true);
        toggleShow.textContent = "Show more  ↓"
    } else {
        document.querySelector(".table-container").setAttribute("aria-expanded", true);
        dropDownCol.setAttribute("aria-expanded", true);
        columns.setAttribute("aria-hidden", false);
        toggleShow.textContent = "Show less  ↑"
    }
}

function leaderboardToken(leaderboard) {
    alwaysShow.innerHTML = "";
    canHide.innerHTML = "";

    for (let [i, user] of leaderboard.entries()) {
        if (i === 10) return;

        const id = user["$id"];
        const balance = formatNumber(user["balance"]);
        const userRank = ++i + ".";  
    
        const rankColumn = createColumn(userRank);
        const userColumn = createColumn(id);
        const balanceColumn = createColumn(balance);
        
        const tr = document.createElement("div");
        tr.classList.add("tr");
        tr.appendChild(rankColumn);
        tr.appendChild(userColumn);
        tr.appendChild(balanceColumn);

        if (i <= 5) {
            alwaysShow.appendChild(tr);
        } else {
            canHide.appendChild(tr);
        }
    }
}


function createColumn(textContent) {
    const column = document.createElement("div");
    column.classList.add("td");
    const p = document.createElement("p")
    p.textContent = textContent;
    column.appendChild(p);

    return column;
}

function formatNumber(num) {
    if (num >= 1000000) {
        const divided = (num / 1000000).toFixed(1);
        return (divided % 1 === 0 ? Math.round(divided)  : divided) + 'M';
    }

    if (num >= 1000) {
        const divided = (num / 1000).toFixed(1);
        return (divided % 1 === 0 ? Math.round(divided)  : divided) + 'K';
    }

    return num.toString();
}
