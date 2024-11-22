// Global variables to store state
let validUsernames = [];
let lastValidInput = '';

async function verifyUsernames() {
    console.log('Verifying usernames...');
    const usersearch = document.querySelector('.js-username');
    const usernames = usersearch.value.split(';').map(username => username.trim()).filter(username => username !== '');
   
    if (usernames.length === 0) {
        alert('Please enter at least one username');
        return;
    }
   
    usersearch.classList.remove('valid', 'invalid');
    const statusDiv = document.querySelector('.username-status');
    statusDiv.innerHTML = '';
   
    const results = await Promise.all(usernames.map(checkUsername));
   
    let allValid = true;
    validUsernames = [];
    results.forEach(({username, isValid}) => {
        const status = document.createElement('div');
        status.textContent = `${username}: ${isValid ? 'Valid' : 'Invalid'}`;
        status.classList.add(isValid ? 'valid' : 'invalid');
        statusDiv.appendChild(status);
        if (isValid) {
            validUsernames.push(username);
        } else {
            allValid = false;
        }
    });
   
    usersearch.classList.add(allValid ? 'valid' : 'invalid');

    if (allValid) {
        enableRatingAndQuestionInputs();
        lastValidInput = usersearch.value;
    } else {
        disableRatingAndQuestionInputs();
    }

    // Save state to localStorage
    saveState();
    console.log('Username verification complete.');
}

function enableRatingAndQuestionInputs() {
    console.log('Enabling inputs...');
    document.querySelector('.minrating').disabled = false;
    document.querySelector('.maxrating').disabled = false;
    document.querySelector('.question').disabled = false;
    document.querySelector('.fetch-problems-btn').disabled = false;
}

function disableRatingAndQuestionInputs() {
    console.log('Disabling inputs...');
    document.querySelector('.minrating').disabled = true;
    document.querySelector('.maxrating').disabled = true;
    document.querySelector('.question').disabled = true;
    document.querySelector('.fetch-problems-btn').disabled = true;
}

function resetAll() {
    console.log('Resetting all...');
    document.querySelector('.js-username').value = '';
    document.querySelector('.js-username').classList.remove('valid', 'invalid');
    document.querySelector('.username-status').innerHTML = '';
    document.querySelector('.minrating').value = '';
    document.querySelector('.maxrating').value = '';
    document.querySelector('.question').value = '';
    document.querySelector('.problem-list').innerHTML = '';
    disableRatingAndQuestionInputs();
    validUsernames = [];
    lastValidInput = '';

    // Clear localStorage
    localStorage.removeItem('cfProblemSelectorState');
}

function saveState() {
    console.log('Saving state...');
    const state = {
        usernames: document.querySelector('.js-username').value,
        minRating: document.querySelector('.minrating').value,
        maxRating: document.querySelector('.maxrating').value,
        numQuestions: document.querySelector('.question').value,
        validUsernames: validUsernames,
        lastValidInput: lastValidInput
    };
    localStorage.setItem('cfProblemSelectorState', JSON.stringify(state));
}

function loadState() {
    console.log('Loading state...');
    const savedState = localStorage.getItem('cfProblemSelectorState');
    if (savedState) {
        const state = JSON.parse(savedState);
        document.querySelector('.js-username').value = state.usernames;
        document.querySelector('.minrating').value = state.minRating;
        document.querySelector('.maxrating').value = state.maxRating;
        document.querySelector('.question').value = state.numQuestions;
        validUsernames = state.validUsernames;
        lastValidInput = state.lastValidInput;

        if (validUsernames.length > 0) {
            enableRatingAndQuestionInputs();
            document.querySelector('.js-username').classList.add('valid');
        }
    }
}

async function checkUsername(username) {
    console.log(`Checking username: ${username}`);
    const URL = `https://codeforces.com/api/user.info?handles=${username}&checkHistoricHandles=false`;
    try {
        const response = await fetch(URL);
        const data = await response.json();
        return { username, isValid: data.status === 'OK' };
    } catch (error) {
        console.error('Error:', error);
        return { username, isValid: false };
    }
}

async function fetchAndDisplayProblems() {
    console.log('Fetching and displaying problems...');
    const minRating = parseInt(document.querySelector('.minrating').value);
    const maxRating = parseInt(document.querySelector('.maxrating').value);
    const numQuestions = parseInt(document.querySelector('.question').value);

    if (isNaN(minRating) || isNaN(maxRating) || isNaN(numQuestions)) {
        alert('Please enter valid numbers for ratings and number of questions');
        return;
    }

    if (minRating > maxRating) {
        alert('Minimum rating should be less than or equal to maximum rating');
        return;
    }

    const problems = await fetchProblems(minRating, maxRating, numQuestions);
    const solvedProblems = await fetchSolvedProblems(validUsernames);
    const filteredProblems = filterProblems(problems, solvedProblems, numQuestions);

    displayProblems(filteredProblems);
}

async function fetchProblems(minRating, maxRating, numQuestions) {
    console.log('Fetching problems...');
    const URL = 'https://codeforces.com/api/problemset.problems?tags=implementation';
    try {
        const response = await fetch(URL);
        const data = await response.json();
        return data.result.problems.filter(problem => 
            problem.rating >= minRating && problem.rating <= maxRating
        );
    } catch (error) {
        console.error('Error fetching problems:', error);
        return [];
    }
}

async function fetchSolvedProblems(usernames) {
    console.log('Fetching solved problems...');
    const solvedProblems = new Set();
    for (const username of usernames) {
        const URL = `https://codeforces.com/api/user.status?handle=${username}&from=1&count=1000`;
        try {
            const response = await fetch(URL);
            const data = await response.json();
            data.result.forEach(submission => {
                if (submission.verdict === 'OK') {
                    solvedProblems.add(`${submission.problem.contestId}${submission.problem.index}`);
                }
            });
        } catch (error) {
            console.error(`Error fetching solved problems for ${username}:`, error);
        }
    }
    return solvedProblems;
}

function filterProblems(problems, solvedProblems, numQuestions) {
    console.log('Filtering problems...');
    const unsolvedProblems = problems.filter(problem => 
        !solvedProblems.has(`${problem.contestId}${problem.index}`)
    );
    return shuffle(unsolvedProblems).slice(0, numQuestions);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function displayProblems(problems) {
    console.log('Displaying problems...');
    const problemListDiv = document.querySelector('.problem-list');
    problemListDiv.innerHTML = '';

    if (problems.length === 0) {
        problemListDiv.textContent = 'No matching unsolved problems found. Try adjusting your criteria.';
    } else {
        problems.forEach(problem => {
            const problemDiv = document.createElement('div');
            problemDiv.className = 'problem-item';
            
            const link = document.createElement('a');
            link.href = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;
            link.target = '_blank';
            link.textContent = `${problem.name} (Rating: ${problem.rating})`;

            problemDiv.appendChild(link);
            problemListDiv.appendChild(problemDiv);
        });
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    document.querySelector('.js-username').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyUsernames();
        }
    });

    document.querySelector('.search-button').addEventListener('click', verifyUsernames);

    document.querySelector('.fetch-problems-btn').addEventListener('click', fetchAndDisplayProblems);

    document.querySelector('.home-button').addEventListener('click', resetAll);

    // Load state on page load
    loadState();
});