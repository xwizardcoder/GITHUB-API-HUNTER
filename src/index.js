const statusDiv = document.getElementById("status");
const resultDiv = document.getElementById("result");

function setMode(mode) {
  statusDiv.innerHTML = "";
  resultDiv.innerHTML = "";

  document.getElementById("singleMode")
    .classList.toggle("hidden", mode !== "single");
  document.getElementById("battleMode")
    .classList.toggle("hidden", mode !== "battle");
}


function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}


async function fetchUser(username) {
  try {
    const userRes = await axios.get(
      `https://api.github.com/users/${username}`
    );

    const user = userRes.data;

    const repoRes = await axios.get(user.repos_url);
    const repos = repoRes.data;

    const latestRepos = repos
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count, 0
    );

    return { user, latestRepos, totalStars };

  } catch (error) {
    throw new Error("User Not Found");
  }
}


function createCard(data, bgColor) {
  return `
    <div class="${bgColor} p-5 w-96 rounded-lg shadow-[__0px_0px_5px_0px_white] border-2 border-gray-300 text-black">
      <img src="${data.user.avatar_url}"
        class="w-24 h-24 rounded-full mx-auto mb-3" />

      <h2 class="text-xl font-bold text-center">
        ${data.user.name || data.user.login}
      </h2>

      <p class="text-center text-gray-600 mb-2">
        ${data.user.bio || "No bio available"}
      </p>

      <p class="text-sm text-center">
        Joined: ${formatDate(data.user.created_at)}
      </p>

      ${
        data.user.blog
          ? `<a href="${data.user.blog}" target="_blank"
              class="block text-center text-blue-600 mt-2 break-all">
              ${data.user.blog}
            </a>`
          : ""
      }

      <div class="mt-4">
        <h3 class="font-semibold mb-2">Latest Repositories</h3>
        ${data.latestRepos.map(repo => `
          <a href="${repo.html_url}" target="_blank"
            class="block text-blue-500 hover:underline">
            ${repo.name}
          </a>
        `).join("")}
      </div>

      <div class="mt-4 text-sm">
        ⭐ Total Stars: <strong>${data.totalStars}</strong><br>
        👥 Followers: <strong>${data.user.followers}</strong>
      </div>
    </div>
  `;
}


async function searchUser() {
  const username = document.getElementById("username").value.trim();
  if (!username) return;

  statusDiv.innerHTML = "Loading...";
  resultDiv.innerHTML = "";

  try {
    const data = await fetchUser(username);
    statusDiv.innerHTML = "";
    resultDiv.innerHTML = createCard(data, "bg-white");

     document.getElementById("username").value = "";

    
  } catch (err) {
    statusDiv.innerHTML = `<span class="text-red-600">${err.message}</span>`;
  }
}


async function battle() {
  const u1 = document.getElementById("user1").value.trim();
  const u2 = document.getElementById("user2").value.trim();
  if (!u1 || !u2) return;

  statusDiv.innerHTML = "Battling...";
  resultDiv.innerHTML = "";

  try {
    const [p1, p2] = await Promise.all([
      fetchUser(u1),
      fetchUser(u2)
    ]);

    const p1Score = p1.totalStars;
    const p2Score = p2.totalStars;

    let p1Bg = "bg-white";
    let p2Bg = "bg-white";

    if (p1Score > p2Score) {
      p1Bg = "bg-green-100";
      p2Bg = "bg-red-100";
    } else if (p2Score > p1Score) {
      p1Bg = "bg-red-100";
      p2Bg = "bg-green-100";
    }
    document.getElementById("user1").value = "";
    document.getElementById("user2").value = "";
    statusDiv.innerHTML = "";

    resultDiv.innerHTML =
      createCard(p1, p1Bg) +
      createCard(p2, p2Bg);

  } catch (err) {
    statusDiv.innerHTML = `<span class="text-red-600">${err.message}</span>`;
  }
}


document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
  
    const singleInput = document.getElementById("username");
    if (!singleInput.classList.contains("hidden")) {
      searchUser();
    }

  
    const user1 = document.getElementById("user1");
    const user2 = document.getElementById("user2");

    if (
      !user1.classList.contains("hidden") ||
      !user2.classList.contains("hidden")
    ) {
      battle();
    }
  }
});
