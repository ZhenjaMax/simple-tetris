function displayLeaderboard(){
    if (!localStorage["leaderboard"])
        return;
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
    let list = "";
    for (let i in leaderboard)
        list += `<li>${leaderboard[i].username} - ${leaderboard[i].score}</li>`
    document.getElementById("leaderboard").innerHTML = list;
}
