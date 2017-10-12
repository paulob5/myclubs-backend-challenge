# myClubs Backend Challenge

After users participate in a workout, we ask them to provide feedback on how they liked or disliked their workout. This lets us gather valuable data about our partner network and about the things people enjoy.

You get asked to provide a way for the operations team to get the average rating a user has provided to see if they are generally happy with our product or if we should reach out to them to see how we can improve things. Christoph and Lukas tell you that they had to implement the feedback service in a hurry a few months ago and sloppily did so, so there might be a few rough patches in there which you could fix on the way.

From this briefing you gather that your goal should look roughly as follows:

## Feat

* Implement a method which computes the average rating for a user.
  * Make this method availabe as an HTTP endpoint with the signature `/feedback/users/:userId/`
* Hint: Look at the basic structure of dataStore queries and fetch the feedback entries with a user pointer constraint.

## Test

* There are 2 test cases for a method sanitizing the supplied feedback terms. Please implement the tests.

## Fix

* Christoph and Lukas warned you that there might be dragons. How will you handle them?

## Getting Started

You can install the project dependencies with `npm install`, run the tests with `npm run test` and run the server with `npm run dev`.

## Deliverable

Fork this repository and submit you results as pull request. 
