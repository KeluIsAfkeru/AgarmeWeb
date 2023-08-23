export default class LeaderBoard {
    constructor(maxPlayers) {
        this.players = [];
        this.maxPlayers = maxPlayers;
    }

    addPlayer(id, name, score) {
        id = id.toString();
        this.players.push({
            id,
            name,
            score
        });
        this.sortPlayers();
        this.updateLeaderboardDisplay();
    }

    updatePlayerScore(id, newScore) {
        id = id.toString();
        let player = this.players.find(player => player.id === id);
        if (player) {
            player.score = newScore;
            this.sortPlayers();
            this.updateLeaderboardDisplay();
        }
    }

    sortPlayers() {
        this.players.sort((a, b) => b.score - a.score);
    }

    getPlayerById(id) {
        return this.players.find(player => player.id === id);
    }

    getPlayers() {
        return this.players;
    }

    updateLeaderboardDisplay() {
        const leaderboardElement = document.querySelector('#leaderboard');
        leaderboardElement.innerHTML = '';

        const playersToDisplay = this.players.slice(0, this.maxPlayers);
        playersToDisplay.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.classList.add('player');

            const nameElement = document.createElement('span');
            nameElement.classList.add('name');
            nameElement.textContent = `${player.name}[${player.score}]`.padEnd(20);

            const rankElement = document.createElement('span');
            rankElement.classList.add('rank');
            rankElement.textContent = index + 1;

            playerElement.appendChild(nameElement);
            playerElement.appendChild(rankElement);
            leaderboardElement.appendChild(playerElement);
        });
    }

    // updateLeaderboardDisplay(users) {
    //     const leaderboardElement = document.querySelector('#leaderboard');
    //     leaderboardElement.innerHTML = '';

    //     const playersToDisplay = users.slice(0, this.maxPlayers);
    //     playersToDisplay.forEach((user, index) => {
    //         const playerElement = document.createElement('div');
    //         playerElement.classList.add('player');

    //         const nameElement = document.createElement('span');
    //         nameElement.classList.add('name');
    //         nameElement.textContent = `${user.name}[${user.score}]`.padEnd(20);

    //         const rankElement = document.createElement('span');
    //         rankElement.classList.add('rank');
    //         rankElement.textContent = index + 1;

    //         playerElement.appendChild(nameElement);
    //         playerElement.appendChild(rankElement);
    //         leaderboardElement.appendChild(playerElement);
    //     });
    // }
}
