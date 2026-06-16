let db;
let corporations = [];

let players = [];
let playerNames = [];
let currentPlayer = 0;

const request =
    indexedDB.open(
        "TerraformDraftDB",
        1
    );

request.onupgradeneeded =
function(event){

    db =
        event.target.result;

    if(
        !db.objectStoreNames.contains(
            "corporations"
        )
    ){

        db.createObjectStore(
            "corporations",
            {
                keyPath:"id",
                autoIncrement:true
            }
        );
    }
};

request.onsuccess =
function(event){

    db =
        event.target.result;

    loadCorporations();

    createPlayerInputs();
};

request.onerror =
function(){

    alert(
        "データベース作成失敗"
    );
};

function updateCount() {

    document.getElementById("count").innerText =
        `登録企業数: ${corporations.length}`;
}

function loadCorporations(){

const transaction =
    db.transaction(
        ["corporations"],
        "readonly"
    );

const store =
    transaction.objectStore(
        "corporations"
    );

const request =
    store.getAll();

request.onsuccess =
function(){

    corporations =
        request.result;

    updateCount();
};

}


// プレイヤー名入力欄生成
function createPlayerInputs() {

    const count =
        Number(
            document.getElementById("playerCount").value
        );

    const area =
        document.getElementById("playerNames");

    area.innerHTML = "";

    for (let i = 0; i < count; i++) {

        area.innerHTML += `
            <div>
                プレイヤー${i + 1}
                <input
                    id="playerName${i}"
                    placeholder="名前">
            </div>
        `;
    }
}


// 初期表示
window.onload = function () {
    createPlayerInputs();
};


// 画像追加
async function addImages(){

    const files =
        document
        .getElementById(
            "imageInput"
        )
        .files;

    if(files.length===0){

        alert(
            "画像を選択してください"
        );

        return;
    }

    let saved = 0;

    for(const file of files){

        const reader =
            new FileReader();

        reader.onload =
        function(event){

            const img =
                new Image();

            img.onload =
            function(){

                const canvas =
                    document.createElement(
                        "canvas"
                    );

                const maxWidth =
                    1600;

                const scale =
                    maxWidth /
                    img.width;

                canvas.width =
                    maxWidth;

                canvas.height =
                    img.height *
                    scale;

                const ctx =
                    canvas.getContext(
                        "2d"
                    );

                ctx.drawImage(
                    img,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                const compressed =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.95
                    );

                const tx =
                    db.transaction(
                        ["corporations"],
                        "readwrite"
                    );

                const store =
                    tx.objectStore(
                        "corporations"
                    );

                store.add({
                    image:
                    compressed
                });

                saved++;

                if(
                    saved===
                    files.length
                ){

                    loadCorporations();

                    alert(
                        `${saved}枚追加完了`
                    );
                }
            };

            img.src =
                event.target.result;
        };

        reader.readAsDataURL(
            file
        );
    }
}

// 全削除
function clearImages(){

    if(
        !confirm(
            "全企業を削除しますか？"
        )
    ){
        return;
    }

    const tx =
        db.transaction(
            ["corporations"],
            "readwrite"
        );

    const store =
        tx.objectStore(
            "corporations"
        );

    store.clear();

    tx.oncomplete =
    function(){

        corporations = [];

        updateCount();

        alert(
            "削除しました"
        );
    };
}

// シャッフル
function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];
    }
}


// ドラフト開始
function startDraft() {

    const playerCount =
        Number(
            document.getElementById(
                "playerCount"
            ).value
        );

    if (
        corporations.length <
        playerCount * 2
    ) {

        alert(
            "企業画像が足りません"
        );

        return;
    }

    const deck =
        [...corporations];

    shuffle(deck);

    players = [];
    playerNames = [];

    for (
        let i = 0;
        i < playerCount;
        i++
    ) {

        playerNames.push(

            document
                .getElementById(
                    `playerName${i}`
                )
                .value

            ||

            `プレイヤー${i + 1}`
        );

        players.push({

            choices: [
                deck.pop(),
                deck.pop()
            ],

            selected: null

        });
    }

    currentPlayer = 0;

    document
        .getElementById(
            "draftArea"
        )
        .classList
        .add("hidden");

    document
        .getElementById(
            "resultArea"
        )
        .classList
        .add("hidden");

    document
        .getElementById(
            "nextPlayerArea"
        )
        .classList
        .remove("hidden");

    document
        .getElementById(
            "nextPlayerText"
        )
        .innerText =
        `${playerNames[0]} さんに渡してください`;
}


// 次へ
function nextPlayer() {

    document
        .getElementById(
            "nextPlayerArea"
        )
        .classList
        .add("hidden");

    document
        .getElementById(
            "draftArea"
        )
        .classList
        .remove("hidden");

    showPlayer();
}


// プレイヤー表示
function showPlayer() {

    const player =
        players[currentPlayer];

    document
        .getElementById(
            "playerTitle"
        )
        .innerText =
        `${playerNames[currentPlayer]}
さんの企業選択`;

    document
        .getElementById(
            "card1"
        )
        .src =
        player.choices[0].image;

    document
        .getElementById(
            "card2"
        )
        .src =
        player.choices[1].image;
}


// 企業選択
function selectCard(index) {

    const player =
        players[currentPlayer];

    player.selected =
        player.choices[index];

    currentPlayer++;

    if (
        currentPlayer >=
        players.length
    ) {

        showResults();

        return;
    }

    document
        .getElementById(
            "draftArea"
        )
        .classList
        .add("hidden");

    document
        .getElementById(
            "nextPlayerArea"
        )
        .classList
        .remove("hidden");

    document
        .getElementById(
            "nextPlayerText"
        )
        .innerText =
        `${playerNames[currentPlayer]}
さんに渡してください`;
}


// 結果表示
function showResults() {

    document
        .getElementById(
            "draftArea"
        )
        .classList
        .add("hidden");

    document
        .getElementById(
            "nextPlayerArea"
        )
        .classList
        .add("hidden");

    document
        .getElementById(
            "resultArea"
        )
        .classList
        .remove("hidden");

    const results =
        document.getElementById(
            "results"
        );

    results.innerHTML = "";

    players.forEach(
        (player, index) => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "result-card";

            div.innerHTML = `
                <h3>
                    ${playerNames[index]}
                </h3>

                <img
                    src="${player.selected.image}">
            `;

            results.appendChild(div);
        }
    );
}
