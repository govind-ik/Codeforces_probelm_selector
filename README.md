# Codeforces_probelm_selector

https://govind-ik.github.io/Codeforces_probelm_selector/

A Codeforces Problem Selector tool designed to help competitive programmers practice efficiently by generating a list of unsolved problems based on multiple Codeforces user handles, difficulty ranges, and desired number of problems.

Features

    Input multiple Codeforces handles to collaboratively practice.
    Set a difficulty range to filter problems.
    Specify the number of problems you wish to practice.
    Ensures problems shown are unsolved by all provided users.
    Great for individual practice, competitive sessions, or friendly challenges.

How It Works

    Users enter:
        Codeforces handles (one or more).
        Difficulty range (minimum and maximum rating).
        Number of problems to generate.
    The tool fetches user data and problem statistics from the Codeforces API.
    Filters out problems that:
        Have been solved by any of the provided users.
        Do not fall within the specified difficulty range.
    Displays a random set of problems meeting the criteria.

Technologies Used

    HTML, CSS, JavaScript: For front-end UI.
    Codeforces API: To fetch user and problem data.
